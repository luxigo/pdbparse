# pdbparse
filter and convert pdbedit -L -v output to json

## License
AGPL-3.0 or later

## How to
Export the database of samba users with:
```
pdbedit -L -v > sam.txt
```

If not yet installed, install nodejs (with nvm I suggest), eg:
```
wget https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
nvm install --lts
```

Install pdbparse:
```
npm install -g pdbparse
```

## As a command:
Usage:
```
pdbparse [<input_file>] [-h|--help] [-u|--usernames] [-a|--active] [-d|--disabled] [-f|--filter 'return !user.account_flags.match(/D/)']
```

Convert with eg:
```
pdbparse sam.txt
```

Alternatively you can convert the json to csv with:
```
npm i -g json2csv
npm i -g equalizejson
pdbparse sam.txt | equalizejson | json2csv
```

## As a module:
```
const pdbparse=require('pdbparse');
pdparse(var stream=process.stdin, var filter=((user) => {return true}))
.then((user_list) => {...})
```
... where "stream" is process.stdin by default or a filestream, and "filter" an optional filtering function.
 


