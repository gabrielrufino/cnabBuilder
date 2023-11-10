#!/usr/bin/env node

'use strict';
import path from 'path'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url';

import yargs from 'yargs'
import chalk from 'chalk'

const optionsYargs = yargs(process.argv.slice(2))
  .usage('Uso: $0 [options]')
  .option("f", { alias: "from", describe: "posição inicial de pesquisa da linha do Cnab", type: "number" })
  .option("t", { alias: "to", describe: "posição final de pesquisa da linha do Cnab", type: "number" })
  .option("s", { alias: "segmento", describe: "tipo de segmento", type: "string" })
  .option('file', { describe: "caminho para o arquivo", type: "string" })
  .option('search', { describe: "busca pela empresa", type: "string" })
  .example('$0 -f 21 -t 34 -s p', 'lista a linha e campo que from e to do cnab')
  .argv;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  from,
  to,
  segmento,
  file = path.resolve(`${__dirname}/cnabExample.rem`),
  search
} = optionsYargs

const sliceArrayPosition = (arr, ...positions) => [...arr].slice(...positions)

const messageLog = (segmento, segmentoType, from, to) => `
----- Cnab linha ${segmentoType} -----

posição from: ${chalk.inverse.bgBlack(from)}

posição to: ${chalk.inverse.bgBlack(to)}

item isolado: ${chalk.inverse.bgBlack(segmento.substring(from - 1, to))}

item dentro da linha ${segmentoType}: 
  ${segmento.substring(0, from)}${chalk.inverse.bgBlack(segmento.substring(from - 1, to))}${segmento.substring(to)}

----- FIM ------
`

const log = console.log

console.time('leitura Async')

readFile(file, 'utf8')
  .then(file => {
    const cnabArray = file.split('\n')

    const cnabHeader = sliceArrayPosition(cnabArray, 0, 2)

    if (search) {
      const row = cnabArray.find(row => row.includes(search))
            
      if (row) {
        const segmentType = row.split('').find(letter => ['P', 'Q', 'R'].includes(letter))
        const initial = row.search(search) + 1
        const final = initial + search.length - 1

        log(messageLog(row, segmentType, initial, final))
      }

      return
    }

    const [cnabBodySegmentoP, cnabBodySegmentoQ, cnabBodySegmentoR] = sliceArrayPosition(cnabArray, 2, -2)

    const cnabTail = sliceArrayPosition(cnabArray, -2)

    if (segmento === 'p') {
      log(messageLog(cnabBodySegmentoP, 'P', from, to))
      return
    }

    if (segmento === 'q') {
      log(messageLog(cnabBodySegmentoQ, 'Q', from, to))
      return
    }

    if (segmento === 'r') {
      log(messageLog(cnabBodySegmentoR, 'R', from, to))
      return
    }

  })
  .catch(error => {
    console.error("🚀 ~ file: cnabRows.js ~ line 94 ~ error", error)
  })
console.timeEnd('leitura Async')
