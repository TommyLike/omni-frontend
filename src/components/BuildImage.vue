<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
            :src="require('../assets/openeuler-logo.png')"
            class="md"
            contain
            height="100"
        />
      </v-col>

      <v-col class="mb-6" cols="12">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to build your own image
        </h1>

        <p class="subheading font-weight-regular">
          Customize your own openEuler image within two steps
        </p>
      </v-col>
      <v-col
          class="mb-6"
          cols="12"
      >
        <h2>Version</h2>
        <v-select
            item-text="name"
            item-value="name"
            v-model="defaultVersionSelected"
            :items="availableVersion"
        ></v-select>
        <h2>Packages</h2>
        <v-select
            item-text="name"
            item-value="name"
            v-model="defaultPackages"
            :items="availablePackages"
        ></v-select>
        <h2>ImageType</h2>
        <v-select
            item-text="name"
            item-value="name"
            v-model="defaultImageType"
            :items="availableImageType"
        ></v-select>
        <v-btn
            color="primary"
            elevation="18"
            rounded
            :disabled="jobRunning"
            x-large
            v-on:click="submitJob"
        >Start Build</v-btn>
        <v-alert
            :value="alert"
            dark
            border="left"
            type="error"
            transition="slide-y-transition"
        >
          {{ errorMessage }}
        </v-alert>
      </v-col>
      <v-col cols="6">
        <v-card
            class="pa-0"
            tile
        >
          <v-card-title>Job Name</v-card-title>
          <v-card-subtitle> {{ currentJobName }}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card
            class="pa-0"
            tile
        >
          <v-card-title>Start Time</v-card-title>
          <v-card-subtitle>{{currentJobStartTime}}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col cols="2">
        <v-card
            class="pa-0"
            tile
        >
          <v-card-title>Job Status</v-card-title>
          <v-card-subtitle> {{ currentJobStatus}} </v-card-subtitle>
        </v-card>
      </v-col>
      <v-col
          class="mb-0"
          cols="12"
      >
        <h3>Detail</h3>
        <v-textarea
            rows="40"
            cols="100"
            readonly
            outlined
            filled
            label="console"
            no-resize
            :value="consoleOutput"
        ></v-textarea>
      </v-col>

    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: 'BuildImage',
  mounted: function () {
    if(alert){
      this.hideAlert();
    }
  },
  methods: {
    hideAlert: function () {
      console.log('Hide')
      window.setInterval(() => {
        this.alert = false;
        this.errorMessage = ""
      }, 3000)
    },
    submitJob: function() {
      console.log(this.defaultVersionSelected.name + this.defaultPackages.name, this.defaultImageType.name)
      let requestParameters = {
        version: this.defaultVersionSelected.name,
        packages: this.defaultPackages.name,
        buildType: this.defaultImageType.name
      }
      axios.post("/api/images", requestParameters).then(response => {
        this.currentJobName = response.data.name
        this.jobRunning = true
        this.queryJobStatus = setInterval(function (context){
            axios.get(`/api/images/${context.currentJobName}`).then(response => {
              console.log(response.data)
              context.currentJobStatus = response.data.status
              context.currentJobStartTime = response.data.startTime
              if (context.currentJobStatus !== "running") {
                if (context.queryJobStatus) {
                  context.jobRunning = false
                  clearInterval(context.queryJobStatus)
                }
              }
            }).catch(error => {
              console.log("query job status errored")
              context.errorMessage = error.message
              context.alert = true
            })
        }, 5000, this)
      }).catch(error => {
            this.errorMessage = error.message
            this.jobRunning = false
            this.alert = true
            if (this.queryJobStatus) {
              clearInterval(this.queryJobStatus)
            }
      })
    }
  },
  data: () => ({
    jobRunning: false,
    queryJobStatus: null,
    currentJobName: " ",
    currentJobStatus: " ",
    currentJobStartTime: " ",
    errorMessage: "",
    alert: false,
    defaultImageType: {
      name: "installer-iso"
    },
    availableImageType: [
      {
        name: "installer-iso"
      },
      {
        name: "livecd-iso"
      },
      {
        name: "vhd"
      }
    ],
    defaultPackages: {
      name: "openEuler-minimal"
    },
    availablePackages: [
      {
        name: "openEuler-minimal"
      }
    ],
    defaultVersionSelected: {
      name: "openEuler-20.03-LTS",
    },
    availableVersion: [
      {
        name: "openEuler-20.03-LTS",
      },
      {
        name: "openEuler-20.03-LTS-SP1",
      },
      {
        name: "openEuler-20.03-LTS-SP2",
      },
      {
        name: "openEuler-20.03-LTS-SP3",
      },
      {
        name: "openEuler-20.09",
      },
      {
        name: "openEuler-21.03",
      },
      {
        name: "openEuler-21.09",
      }
    ],
    baseVersion: "",
    packageCollection: "",
    consoleOutput: `
Unable to detect release version (use '--releasever' to specify release version)
OS                                               23 MB/s | 3.3 MB     00:00
everything                                       59 MB/s |  16 MB     00:00
EPOL                                             28 MB/s | 3.1 MB     00:00
debuginfo                                        41 MB/s | 3.7 MB     00:00
source                                           23 MB/s | 1.5 MB     00:00
update                                          328 kB/s | 5.2 kB     00:00
Dependencies resolved.
================================================================================
 Package                  Architecture Version               Repository    Size
================================================================================
Installing:
 filesystem               x86_64       3.14-2.oe1            OS           1.1 M
Installing dependencies:
 basesystem               noarch       12-2.oe1              OS           6.9 k
 bash                     x86_64       5.1-2.oe1             OS           1.2 M
 bc                       x86_64       1.07.1-10.oe1         OS            89 k
 glibc                    x86_64       2.34-4.oe1            OS           2.9 M
 glibc-common             x86_64       2.34-4.oe1            OS           1.8 M
 info                     x86_64       6.7-2.oe1             OS           173 k
 libselinux               x86_64       3.1-3.oe1             OS           110 k
 libsepol                 x86_64       3.1-5.oe1             OS           276 k
 ncurses-base             noarch       6.2-2.oe1             OS            53 k
 ncurses-libs             x86_64       6.2-2.oe1             OS           282 k
 openEuler-gpg-keys       x86_64       1.0-3.2.oe1           update        10 k
 openEuler-release        x86_64       21.09-47.oe1          OS            23 k
 openEuler-repos          x86_64       1.0-3.2.oe1           update       9.2 k
 pcre2                    x86_64       10.36-1.oe1           OS           591 k
 readline                 x86_64       8.0-3.oe1             OS           147 k
 setup                    noarch       2.13.8-1.oe1          OS           148 k
 tzdata                   noarch       2021b-1.oe1           OS           428 k
 zlib                     x86_64       1.2.11-18.oe1         OS            88 k
Transaction Summary
================================================================================
Install  19 Packages
Total download size: 9.3 M
Installed size: 252 M
Downloading Packages:
(1/19): basesystem-12-2.oe1.noarch.rpm          915 kB/s | 6.9 kB     00:00
(2/19): bc-1.07.1-10.oe1.x86_64.rpm             3.6 MB/s |  89 kB     00:00
(3/19): filesystem-3.14-2.oe1.x86_64.rpm         32 MB/s | 1.1 MB     00:00
(4/19): bash-5.1-2.oe1.x86_64.rpm                22 MB/s | 1.2 MB     00:00
(5/19): info-6.7-2.oe1.x86_64.rpm                22 MB/s | 173 kB     00:00
(6/19): libselinux-3.1-3.oe1.x86_64.rpm          16 MB/s | 110 kB     00:00
(7/19): libsepol-3.1-5.oe1.x86_64.rpm            26 MB/s | 276 kB     00:00
(8/19): ncurses-base-6.2-2.oe1.noarch.rpm        10 MB/s |  53 kB     00:00
(9/19): glibc-common-2.34-4.oe1.x86_64.rpm       29 MB/s | 1.8 MB     00:00
(10/19): ncurses-libs-6.2-2.oe1.x86_64.rpm       13 MB/s | 282 kB     00:00
(11/19): openEuler-release-21.09-47.oe1.x86_64. 4.4 MB/s |  23 kB     00:00
(12/19): readline-8.0-3.oe1.x86_64.rpm           19 MB/s | 147 kB     00:00
(13/19): setup-2.13.8-1.oe1.noarch.rpm           23 MB/s | 148 kB     00:00
(14/19): pcre2-10.36-1.oe1.x86_64.rpm            26 MB/s | 591 kB     00:00
(15/19): zlib-1.2.11-18.oe1.x86_64.rpm           13 MB/s |  88 kB     00:00
(16/19): tzdata-2021b-1.oe1.noarch.rpm           24 MB/s | 428 kB     00:00
(17/19): openEuler-gpg-keys-1.0-3.2.oe1.x86_64. 2.3 MB/s |  10 kB     00:00
(18/19): openEuler-repos-1.0-3.2.oe1.x86_64.rpm 2.9 MB/s | 9.2 kB     00:00
(19/19): glibc-2.34-4.oe1.x86_64.rpm             17 MB/s | 2.9 MB     00:00
--------------------------------------------------------------------------------
Total                                            47 MB/s | 9.3 MB     00:00
OS                                              157 kB/s | 2.1 kB     00:00
Importing GPG key 0xB25E7F66:
 Userid     : "private OBS (key without passphrase) <defaultkey@localobs>"
 Fingerprint: 12EA 74AC 9DF4 8D46 C69C A0BE D557 065E B25E 7F66
 From       : http://repo.openeuler.org/openEuler-21.09/OS/x86_64/RPM-GPG-KEY-openEuler
Key imported successfully
Running transaction check
Transaction check succeeded.
Running transaction test
Transaction test succeeded.
Running transaction
  Running scriptlet: filesystem-3.14-2.oe1.x86_64                           1/1
  Preparing        :                                                        1/1
  Installing       : openEuler-gpg-keys-1.0-3.2.oe1.x86_64                 1/19
  Installing       : openEuler-repos-1.0-3.2.oe1.x86_64                    2/19
  Installing       : tzdata-2021b-1.oe1.noarch                             3/19
  Installing       : ncurses-base-6.2-2.oe1.noarch                         4/19
  Installing       : libselinux-3.1-3.oe1.x86_64                           5/19
  Installing       : glibc-common-2.34-4.oe1.x86_64                        6/19
  Installing       : openEuler-release-21.09-47.oe1.x86_64                 7/19
  Installing       : setup-2.13.8-1.oe1.noarch                             8/19
  Running scriptlet: setup-2.13.8-1.oe1.noarch                             8/19
  Installing       : filesystem-3.14-2.oe1.x86_64                          9/19
  Installing       : basesystem-12-2.oe1.noarch                           10/19
  Running scriptlet: glibc-2.34-4.oe1.x86_64                              11/19
  Installing       : glibc-2.34-4.oe1.x86_64                              11/19
  Running scriptlet: glibc-2.34-4.oe1.x86_64                              11/19
  Installing       : ncurses-libs-6.2-2.oe1.x86_64                        12/19
  Installing       : bash-5.1-2.oe1.x86_64                                13/19
  Installing       : readline-8.0-3.oe1.x86_64                            14/19
  Installing       : pcre2-10.36-1.oe1.x86_64                             15/19
  Running scriptlet: pcre2-10.36-1.oe1.x86_64                             15/19
  Running scriptlet: libsepol-3.1-5.oe1.x86_64                            16/19
  Installing       : libsepol-3.1-5.oe1.x86_64                            16/19
  Running scriptlet: libsepol-3.1-5.oe1.x86_64                            16/19
  Installing       : zlib-1.2.11-18.oe1.x86_64                            17/19
  Installing       : info-6.7-2.oe1.x86_64                                18/19
  Installing       : bc-1.07.1-10.oe1.x86_64                              19/19
  Running scriptlet: filesystem-3.14-2.oe1.x86_64                         19/19
  Running scriptlet: glibc-common-2.34-4.oe1.x86_64                       19/19
  Verifying        : basesystem-12-2.oe1.noarch                            1/19
  Verifying        : bash-5.1-2.oe1.x86_64                                 2/19
  Verifying        : bc-1.07.1-10.oe1.x86_64                               3/19
  Verifying        : filesystem-3.14-2.oe1.x86_64                          4/19
  Verifying        : glibc-2.34-4.oe1.x86_64                               5/19
  Verifying        : glibc-common-2.34-4.oe1.x86_64                        6/19
  Verifying        : info-6.7-2.oe1.x86_64                                 7/19
  Verifying        : libselinux-3.1-3.oe1.x86_64                           8/19
  Verifying        : libsepol-3.1-5.oe1.x86_64                             9/19
  Verifying        : ncurses-base-6.2-2.oe1.noarch                        10/19
  Verifying        : ncurses-libs-6.2-2.oe1.x86_64                        11/19
  Verifying        : openEuler-release-21.09-47.oe1.x86_64                12/19
  Verifying        : pcre2-10.36-1.oe1.x86_64                             13/19
  Verifying        : readline-8.0-3.oe1.x86_64                            14/19
  Verifying        : setup-2.13.8-1.oe1.noarch                            15/19
  Verifying        : tzdata-2021b-1.oe1.noarch                            16/19
  Verifying        : zlib-1.2.11-18.oe1.x86_64                            17/19
  Verifying        : openEuler-gpg-keys-1.0-3.2.oe1.x86_64                18/19
  Verifying        : openEuler-repos-1.0-3.2.oe1.x86_64                   19/19
Installed:
  basesystem-12-2.oe1.noarch             bash-5.1-2.oe1.x86_64
  bc-1.07.1-10.oe1.x86_64                filesystem-3.14-2.oe1.x86_64
  glibc-2.34-4.oe1.x86_64                glibc-common-2.34-4.oe1.x86_64
  info-6.7-2.oe1.x86_64                  libselinux-3.1-3.oe1.x86_64
  libsepol-3.1-5.oe1.x86_64              ncurses-base-6.2-2.oe1.noarch
  ncurses-libs-6.2-2.oe1.x86_64          openEuler-gpg-keys-1.0-3.2.oe1.x86_64
  openEuler-release-21.09-47.oe1.x86_64  openEuler-repos-1.0-3.2.oe1.x86_64
  pcre2-10.36-1.oe1.x86_64               readline-8.0-3.oe1.x86_64
  setup-2.13.8-1.oe1.noarch              tzdata-2021b-1.oe1.noarch
  zlib-1.2.11-18.oe1.x86_64
Complete!
OS                                              398 kB/s | 3.8 kB     00:00
everything                                      454 kB/s | 3.8 kB     00:00
EPOL                                            300 kB/s | 3.0 kB     00:00
debuginfo                                       522 kB/s | 3.8 kB     00:00
source                                          597 kB/s | 3.8 kB     00:00
update                                          369 kB/s | 3.0 kB     00:00
Dependencies resolved.
================================================================================
 Package                        Arch     Version                     Repo  Size
================================================================================
Installing:
 audit                          x86_64   1:3.0-2.oe1                 OS   178 k
Installing dependencies:
 acl                            x86_64   2.3.1-1.oe1                 OS    51 k
 attr                           x86_64   2.4.48-14.oe1               OS    58 k
 audit-libs                     x86_64   1:3.0-2.oe1                 OS    95 k
 autogen                        x86_64   5.18.16-2.oe1               OS   461 k
 brotli                         x86_64   1.0.9-2.oe1                 OS   316 k
 bzip2                          x86_64   1.0.8-4.oe1                 OS    67 k
 ca-certificates                noarch   2020.2.46-2.oe1             OS   348 k
 chkconfig                      x86_64   1.15-1.oe1                  OS   172 k
 coreutils                      x86_64   8.32-7.oe1                  OS   2.7 M
 cpio                           x86_64   2.13-6.oe1                  OS   259 k
 cracklib                       x86_64   2.9.7-7.oe1                 OS   3.9 M
 crontabs                       noarch   1.11-22.oe1                 OS    17 k
 crypto-policies                noarch   20200619-1.git781bbd4.oe1   OS    82 k
 cryptsetup                     x86_64   2.3.3-5.oe1                 OS   957 k
 curl                           x86_64   7.77.0-3.oe1                OS   140 k
 cyrus-sasl-lib                 x86_64   2.1.27-12.oe1               OS    73 k
 device-mapper                  x86_64   8:1.02.172-5.oe1            OS   229 k
 dracut                         x86_64   055-2.oe1                   OS   292 k
 e2fsprogs                      x86_64   1.45.6-6.oe1                OS   1.1 M
 efi-srpm-macros                noarch   4-3.oe1                     OS    22 k
 elfutils                       x86_64   0.185-2.oe1                 OS   752 k
 expat                          x86_64   2.4.1-1.oe1                 OS    82 k
 file                           x86_64   5.39-6.oe1                  OS    39 k
 file-libs                      x86_64   5.39-6.oe1                  OS   607 k
 findutils                      x86_64   2:4.7.0-7.oe1               OS   389 k
 fuse                           x86_64   2.9.9-9.oe1                 OS   139 k
 fuse-common                    x86_64   3.9.2-6.oe1                 OS   9.2 k
 gamin                          x86_64   0.1.10-38.oe1               OS    66 k
 gawk                           x86_64   5.1.0-1.oe1                 OS   371 k
 gc                             x86_64   8.0.4-4.oe1                 OS   239 k
 perl-PathTools                 x86_64   3.75-5.oe1                  OS    60 k
 perl-Perl-OSType               noarch   1.010-421.oe1               OS    20 k
 perl-PerlIO-via-QuotedPrint    noarch   0.09-1.oe1                  OS    11 k
 perl-Pod-Checker               noarch   4:1.74-1.oe1                OS    23 k
 perl-Pod-Escapes               noarch   1:1.07-420.oe1              OS    14 k
 perl-Pod-Parser                noarch   1.63-398.oe1                OS    57 k
 perl-Pod-Perldoc               noarch   1:3.28-4.oe1                OS    44 k
 perl-Pod-Simple                noarch   1:3.42-2.oe1                OS   137 k
 perl-Pod-Usage                 noarch   4:2.01-2.oe1                OS    25 k
 perl-Scalar-List-Utils         x86_64   4:1.56-1.oe1                OS    51 k
 perl-Socket                    x86_64   4:2.031-1.oe1               OS    43 k
 perl-Storable                  x86_64   1:3.15-2.oe1                OS    77 k
 perl-Sys-Syslog                x86_64   0.36-1.oe1                  OS    37 k
 perl-Term-ANSIColor            noarch   5.01-1.oe1                  OS    30 k
 perl-Term-Cap                  noarch   1.17-510.oe1                OS    18 k
 perl-Test-Harness              noarch   1:3.43_02-1.oe1             OS   130 k
 perl-Test-Simple               noarch   2:1.302175-2.oe1            OS   188 k
 perl-Text-Balanced             noarch   2.04-1.oe1                  OS    29 k
 perl-Text-Diff                 noarch   1.45-7.oe1                  OS    27 k
 perl-Text-ParseWords           noarch   3.30-419.oe1                OS    12 k
 perl-Text-Tabs+Wrap            noarch   2013.0523-419.oe1           OS    14 k
 perl-Thread-Queue              noarch   3.13-3.oe1                  OS    14 k
 perl-Time-HiRes                x86_64   1:1.9764-1.oe1              OS    47 k
 perl-Time-Local                noarch   2:1.300-1.oe1               OS    21 k
 perl-URI                       noarch   5.06-1.oe1                  OS    72 k
 perl-Unicode-Collate           x86_64   1.29-1.oe1                  OS   687 k
 perl-Unicode-Normalize         x86_64   1.26-419.oe1                OS    73 k
 perl-autodie                   noarch   2.32-1.oe1                  OS    56 k
 perl-bignum                    noarch   0.51-1.oe1                  OS    21 k
 perl-constant                  noarch   1.33-421.oe1                OS    17 k
 perl-experimental              noarch   0.022-2.oe1                 OS    18 k
 perl-libnet                    noarch   3.13-1.oe1                  OS    76 k
 perl-libs                      x86_64   4:5.32.0-8.oe1              OS   1.7 M
 perl-parent                    noarch   1:0.238-1.oe1               OS    11 k
 perl-perlfaq                   noarch   5.20200523-2.oe1            OS   176 k
 perl-podlators                 noarch   1:4.14-1.oe1                OS    63 k
 perl-threads                   x86_64   2:2.21-3.oe1                OS    36 k
 perl-threads-shared            x86_64   1.59-4.oe1                  OS    31 k
 perl-version                   x86_64   8:0.99.28-1.oe1             OS    46 k
 pkgconf                        x86_64   1.7.3-1.oe1                 OS    57 k
 popt                           x86_64   1.18-1.oe1                  OS    50 k
 procps-ng                      x86_64   3.3.16-16.oe1               OS   207 k
 publicsuffix-list              noarch   20200718-1.oe1              OS   122 k
 python-pip-wheel               noarch   20.3.3-4.oe1                OS   1.3 M
 python-setuptools              noarch   54.2.0-1.oe1                OS   473 k
 python3                        x86_64   3.8.5-13.oe1                OS   9.2 M
 python3-pyparsing              noarch   2.4.7-3.oe1                 OS   159 k
 qt5-srpm-macros                noarch   5.15.2-1.oe1                OS   8.3 k
 rpm                            x86_64   4.15.1-30.oe1               OS   463 k
 rpm-libs                       x86_64   4.15.1-30.oe1               OS   338 k
 sed                            x86_64   4.8-2.oe1                   OS   166 k
 shadow                         x86_64   2:4.8.1-6.oe1               OS   598 k
 slang                          x86_64   2.3.2-8.oe1                 OS   557 k
 sqlite                         x86_64   3.34.0-3.oe1                OS   1.1 M
 systemd                        x86_64   248-13.oe1                  OS   3.9 M
 systemd-libs                   x86_64   248-13.oe1                  OS   486 k
 systemd-udev                   x86_64   248-13.oe1                  OS   1.3 M
 systemtap-sdt-devel            x86_64   4.4-1.oe1                   OS    19 k
 tcl                            x86_64   1:8.6.10-3.oe1              OS   1.1 M
 tpm2-tss                       x86_64   3.0.3-1.oe1                 OS   556 k
 unbound-libs                   x86_64   1.10.1-6.oe1                OS   745 k
 util-linux                     x86_64   2.36.1-5.oe1                OS   2.3 M
 which                          x86_64   2.21-14.oe1                 OS    30 k
 xkeyboard-config               noarch   2.30-1.oe1                  OS   754 k
 xz                             x86_64   5.2.5-1.oe1                 OS   142 k
 xz-libs                        x86_64   5.2.5-1.oe1                 OS    83 k
 zip                            x86_64   3.0-29.oe1                  OS   222 k
 zstd                           x86_64   1.4.8-2.oe1                 OS   628 k
Installing weak dependencies:
 cronie                         x86_64   1.5.5-3.oe1                 OS   102 k
 diffutils                      x86_64   3.7-5.oe1                   OS   308 k
 e2fsprogs-help                 noarch   1.45.6-6.oe1                OS    94 k
 fuse-help                      x86_64   2.9.9-9.oe1                 OS    13 k
 grubby                         x86_64   8.40-28.oe1                 OS    55 k
 kbd                            x86_64   2.2.0-2.oe1                 OS   249 k
 kpartx                         x86_64   0.8.5-7.oe1                 OS    41 k
 libxkbcommon                   x86_64   1.0.3-1.oe1                 OS   118 k
 openssl-pkcs11                 x86_64   0.4.11-3.oe1                OS    60 k
 perl-Encode-Locale             noarch   1.05-12.oe1                 OS    14 k
 perl-IO-Socket-SSL             noarch   2.068-1.oe1                 OS   175 k
 perl-Mozilla-CA                noarch   1:20200520-1.oe1            OS    10 k
 perl-devel                     x86_64   4:5.32.0-8.oe1              OS   2.1 M
 pigz                           x86_64   2.4-7.oe1                   OS    63 k
 python3-pip                    noarch   20.3.3-4.oe1                OS   2.1 M
 python3-setuptools             noarch   54.2.0-1.oe1                OS   825 k
 shared-mime-info               x86_64   2.1-1.oe1                   OS   296 k
 systemd-help                   noarch   248-13.oe1                  OS   875 k
 trousers                       x86_64   0.3.15-1.oe1                OS   280 k
Transaction Summary
================================================================================
`
  }),
}
</script>
