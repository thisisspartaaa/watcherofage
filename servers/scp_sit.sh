#!/bin/bash --login
prg=watcherofage
p=servers
remote_address=root@106.14.113.215
NODE_ENV=SIT
#NODE_ENV=SIT

#93
 tar zcvf $prg.$p.tar.gz --exclude=sit --exclude=pre ./ && scp -r -i ~/.ssh/id_rsa ./$prg.$p.tar.gz $remote_address:/opt/code/ && ssh -i ~/.ssh/id_rsa $remote_address 'bash /opt/code/restart_huobipro_server.sh '$prg $p $NODE_ENV && rm -rf $prg.$p.tar.gz