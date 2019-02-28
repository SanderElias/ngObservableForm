docker container create --name dummy -v ObservableDist:/root nothing
docker cp /home/sander/Documenten/Talks/ngObservableForm/dist/observableForm/ dummy:/root/*
docker rm dummy
