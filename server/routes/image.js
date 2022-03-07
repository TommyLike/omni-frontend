const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const k8s = require('@kubernetes/client-node');
const stream = require('stream');

// setup kubernetes
const yaml = require('js-yaml');
const kc = new k8s.KubeConfig();
kc.loadFromFile("/Users/tommylike/.kube/infra-test.yaml");
const jobAPI = kc.makeApiClient(k8s.BatchV1Api);
const client = k8s.KubernetesObjectApi.makeApiClient(kc);
const podAPI = kc.makeApiClient(k8s.CoreV1Api);

const VALID_INSTALL_TYPE = ["vhd", "installer-iso", "livecd-iso"]
const VALID_PACKAGES = ["openEuler-minimal"]
const DEFAULT_NAMESPACE = "default"
const JOB_STATUS_RUNNING = "running"
const JOB_STATUS_SUCCEED = "succeed"
const JOB_STATUS_FAILED = "failed"

/* Get Image build job log*/
router.ws("/:id/logs", (ws, req) => {
    console.log(req.params.id)
    ws.on('close', function () {
        console.log('client closed connection')
        ws.close()
    })
    podAPI.listNamespacedPod(DEFAULT_NAMESPACE,null,
        null,
        null,
        null,
        `job-name=${ req.params.id }`).then((response=>{
            console.log(response.body.items)
            if (response.body.items.length <= 0) {
                console.log(`unable to find related pod for job ${req.params.id}`)
                ws.send("unable to find related logs")
                ws.close()

            } else {
                console.log(`starting to collect pod log ${response.body.items[0].metadata.name}`)
                const log = new k8s.Log(kc);
                const logStream = new stream.PassThrough();
                logStream.on('data', (chunk) => {
                   ws.send(chunk)
                });

                log.log('default', response.body.items[0].metadata.name, 'image-builder', logStream, {follow: true, pretty: true, timestamps: false})
                    .catch(err => {console.log(err)})
                    .then(req => {
                        // disconnects after 10 minutes
                        setTimeout(function(){
                            console.log("pod log reaches maximum time")
                            req.abort();
                        }, 1000*60*10);
                    });
            }
        }))
})

/* Query Image build job */
router.get('/:id', (req, res) => {
    console.log(req.params.id)
    jobAPI.readNamespacedJob(req.params.id, DEFAULT_NAMESPACE).then((response)=>{
        if (response.body === undefined) {
            res.sendStatus(404)
            res.send("failed to get task")
        }
        else {
            let completions = response.body.spec.completions
            let backoffLimit = response.body.spec.backoffLimit
            jobAPI.readNamespacedJobStatus(req.params.id, DEFAULT_NAMESPACE).then((response) => {
                if (response.body.status.succeeded >= completions) {
                    console.log(`job ${req.params.id} succeed`)
                    res.send({
                        "Name": req.params.id,
                        "status": JOB_STATUS_SUCCEED,
                        "startTime": response.body.status.startTime,
                        "completionTime": response.body.status.completionTime
                    })
                } else if (response.body.status.failed >= backoffLimit) {
                    console.log(`job ${req.params.id} failed`)
                    res.send({
                        "name": req.params.id,
                        "status": JOB_STATUS_FAILED,
                        "startTime": response.body.status.startTime,
                        "completionTime": response.body.status.completionTime
                    })
                } else if (response.body.status.succeeded === undefined || response.body.status.failed === undefined) {
                    res.send({
                        "name": req.params.id,
                        "status": JOB_STATUS_RUNNING,
                        "startTime": response.body.status.startTime
                    })
                }
            })
        }
    })

})

/* Create Image build job */
router.post('/', body("version").notEmpty(),
    body("packages").isIn(VALID_PACKAGES),
    body("buildType").isIn(VALID_INSTALL_TYPE),
    function(req, res) {
        // parameter validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //prepare job
        let jobID = `omni-image-${uuidv4()}`
        let imageName = `openEuler-${uuidv4()}.iso`
        let imageJob = `
    apiVersion: batch/v1
    kind: Job
    metadata:
      name: ${jobID}
      namespace: ${DEFAULT_NAMESPACE}
    spec:
      ttlSecondsAfterFinished: 1800
      template:
        spec:
          containers:
            - name: image-builder
              image: tommylike/omni-worker:0.0.1
              securityContext:
                privileged: true
              command:
                - /bin/sh
                - -c
                - |
                  omni-imager --package-list /etc/omni-imager/${req.body.packages}.json --config-file /etc/omni-imager/conf.yaml --build-type ${req.body.buildType} --output-file ${imageName}
                  curl -vvv -Ffile=@/opt/omni-workspace/${imageName}  -Fproject=openeuler20.03  -FfileType=image 'https://repo.test.osinfra.cn/data/upload?token=316462d0c029ba707ad2'
          restartPolicy: Never
      backoffLimit: 2
    `
        client.create(yaml.load(imageJob)).then(
            (response) => {
                console.log('Created Job');
                res.send({
                    "name": response.body.metadata.name
                })
            },
            (err) => {
                res.sendStatus(500)
                res.send(err)
            },
        );
});

module.exports = router;
