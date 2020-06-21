import React from 'react';
import { Client } from 'boardgame.io/react';
import { spelldata } from './spelldata';

import { table } from 'table';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const columnCount = 4;
const rowCount = 4;

function parseCoordinate(coord) {
  coord = coord.toUpperCase();
  const pattern = /^([A-Z])([0-9])$/;
  if(pattern.test(coord)) {
    let match = pattern.exec(coord);
    return {
      x: characters.indexOf(match[1]),
      y: parseInt(match[2], 10)
    }
  }
}

function initialisePlayers(cells) {
  cells[0][0] = 0;
  cells[columnCount - 1][rowCount - 1] = 1;
}

function getSpell(id) {
  return spelldata[id];
}

function draw(ctx) {
  let size = ctx.random.Die(20);
  let a = new Array(size).fill(0);
  return a.map(() => spelldata[ctx.random.Die(spelldata.length) - 1]);
}

const Chaos = {
  setup: (ctx) => {
    let cells = [];
    for(let i = 0; i < rowCount; i++) {
      cells.push(Array(columnCount).fill(null))
    }

    initialisePlayers(cells);
    
    return { 
      cells: cells,
      state: 0,
      hand: [
        draw(ctx),
        draw(ctx)
      ]
    }
  },
  moves: {
    castSpell: (G, ctx, spellId, target) => {
      let coord = parseCoordinate(target);
      if (G.cells[coord.x][coord.y] === null) {
        let spellInfo = getSpell(spellId);
        let roll = ctx.random.Die(10) + G.state;
        if(roll <= spellInfo.castChance) {
          G.cells[coord.x][coord.y] = ctx.currentPlayer;
          G.state += spellInfo.chaosRating;
        }
        
      }
    }
  }

};

class ChaosArena extends React.Component {
  render = () => {
    
    let header = Array(columnCount + 1);
    header[0] = null;
    
    for(let i = 1; i < header.length; i++) {
      let multiplier = Math.floor((i - 1) / 26) + 1;
      
      header[i] = characters.charAt((i - 1) % 26).repeat(multiplier);
    }
    let cells = this.props.G.cells.map((a, i) => {
      return [i].concat(a);
    });
    let tab = [header].concat(cells);
    
    let arena = table(tab);
    let spellList = this.props.G.hand[this.props.ctx.currentPlayer].map(s => [s.spellName]);
    let list = table(spellList);
    // console.log(output);
    return (<span><pre>{arena}</pre><pre>{list}</pre></span>);
  }
}

const App = Client({ game: Chaos, board: ChaosArena });

export default App;
