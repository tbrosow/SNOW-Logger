# SNOW-Logger

## YOU NEED TO INSTALL [NODE JS](https://nodejs.org/en/).
### YOU NEED TO KNOW HOW TO OPEN A COMMAND SHELL LOL

## This script reads logs from Service-Now and displays at the console and writes a local log file.
## The query is based on your bookmarks. You need to have bookmarks for specific syslogs.

```Usage: node getlog.js
	-v Verbose Mode
	-c[ConfigFile]
	-l[LogFile]

	Example: node getlog.js -csampleconfig.json -v
```

### Sample config file to start with:
###### Script will replace password with Authentication string
```{
    "instance": "dev15678",
    "logfile": "/Users/torsten/N-Tuition/Projects/XXX/getlogdev.log",
    "username": "admin",
    "password": "YouWillNeverGuessIt"
}
```
SNOW Logger git:(master) node getlog.js -csnowdev.json
###### Changed config file after initial run

```Saved Configfile: snowdev.json
 {
    "auth": "Basic dG9yc3Rlbi5icm9aGFncmlkc29sdXRpb25zLmNvbTp0b3JzdGVuLmJyb3Nvdw==",
    "instance": "snowdev",
    "logfile": "/Users/torsten/N-Tuition/Projects/XXX/getlogdev.log",
    "username": "torsten.brosow@ntuitioncc.com"
} - File saved ...
```



### Example:
Instance: snowdev.service-now.com<br />
Logfile: /Users/torsten/N-Tuition/Projects/XXX/getlogdev.log<br />
<br />
[0] Log ChangeCheckConflicts<br />
[1] Log TB<br />
[2] Log ChangeRequestStateHandler<br />
[3] Log blackout<br /><br />
[4] Log HS_IncidentLibrary<br />
[5] Log HS_ChangeMgmtLibrary<br />
WTF you want to see? 5<br />
OK, cool: 5<br />
Ups - need refresh ... <br />

Ups - need refresh ... <br />
HS_ChangeMgmtLibrary 2020-06-24 23:09:28.721: showUpdateOutageButton<br />

Ups - need refresh ... <br />
HS_ChangeMgmtLibrary 2020-06-24 23:09:28.721: showUpdateOutageButton<br />
HS_ChangeMgmtLibrary 2020-06-24 23:09:30.865: hasPlannedOutages: CHG0030864<br />
HS_ChangeMgmtLibrary 2020-06-24 23:09:30.869: hasPlannedOutages: FALSE<br />
