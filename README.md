# Joyeuse

### Development
* Prerequisites:
  * Docker
  * NodeJS >=16.9.1

```shell
mkdir server/data
chmod 777 server/data
./dev.sh

cd server
npm install
npm run build
# Create a config file somewhere
CONFIG_PATH=./config.yaml npm start
```