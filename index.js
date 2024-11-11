#!/usr/bin/env node
/*
    pbdedit-parser  Parse and filter pdbedit -L -v output
    Copyright (C) 2023 luc.deschenaux@freesurf.ch

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

var fs=require('fs');
var path=require('path');

function parse(stream,filter) {

  return new Promise((resolve,reject) => {

    var list=[];
    var user={};

    const readline = require('readline');

    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity
    });

    var count=0;

    rl.on('line', (line) => {
      if (line=='---------------') {
        if (Object.keys(user).length) {
          if (!filter || (filter && filter(user))) {
            list.push(user)
          }
        }
        user={};
      } else {
        var m=line.match(/([^:]+):(.*)/)
        if (!m) console.error(`unexpected format: ${count} ${line}`);
        else user[m[1].trim().replace(/ /g,'_').toLowerCase()]=m[2].trim();
      }
      ++count;
    });

    rl.on('close', () => {
      resolve(list);
    });

  });

}

function main(){
  const minimist = require('minimist');
  const options= {
    string: ['filter'],
    boolean: ['help','usernames','disabled','active','version'],
    alias: {
      h: 'help',
      f: 'filter',
      u: 'usernames',
      d: 'disabled',
      a: 'active',
      v: 'version'
    }
  }

  const args=minimist(process.argv.slice(2),options);
  var stream=process.stdin;
  var filter;

  if (args.help) {
    help();
  }

  if (args.version) {
    version();
  }

  if (args.disabled) {
    if (args.active||args.filter) throw "mutually exclusive: filter, active, disabled"
    args.filter='return user.account_flags.match(/D/)';
  }
  if (args.active) {
    if (args.disabled||args.filter) throw "mutually exclusive: filter, active, disabled"
    args.filter='return !user.account_flags.match(/D/)';
  }
  if (args.filter) {
    filter=Function('user',args.filter);
  }

  if (args._.length) {
    stream=fs.createReadStream(args._[0]);
  }

  return parse(stream,filter)
  .then((list) => {
    if (args.usernames) {
      list.forEach(function(user){
        console.log(user.unix_username);
      })
    } else {
      console.log(JSON.stringify(list,false,4));
    }
  });
}

function help() {
  var path = require('path');
  console.error(`usage: sudo pdbedit -L -v | pdbparse [<input_file>] [-h|--help] [-u|--usernames] [-a|--active] [-d|--disabled] [-f|--filter 'return !user.account_flags.match(/D/)']`); 
  process.exit(1);
}

function version(){
  var pkg=require(path.resolve(__dirname,'package.json'));
  console.log('v'+pkg.version);
  process.exit(1);
}

const fromCommandLine=(require.main===module);

if (fromCommandLine) {
  main()

} else {
  module.exports=parse;

}
