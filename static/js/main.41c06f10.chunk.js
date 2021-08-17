(this["webpackJsonpsnake-app"]=this["webpackJsonpsnake-app"]||[]).push([[0],{30:function(e,t,i){},31:function(e,t,i){},33:function(e,t,i){},34:function(e,t,i){},36:function(e,t,i){},37:function(e,t,i){},38:function(e,t,i){},39:function(e,t,i){},48:function(e,t,i){"use strict";i.r(t);var n,s=i(1),o=i.n(s),r=i(22),a=i.n(r),c=(i(30),i(31),i(16)),u=i(25),l=i(2),h=i(3);!function(e){e[e.HUMAN=0]="HUMAN",e[e.ASTAR=1]="ASTAR",e[e.HAMILTONIANCYCLE=2]="HAMILTONIANCYCLE"}(n||(n={}));var d,g=n,v=function(){function e(t,i){Object(l.a)(this,e),this.row=void 0,this.column=void 0,this.row=t,this.column=i}return Object(h.a)(e,[{key:"setColumn",value:function(e){this.column=e}},{key:"setRow",value:function(e){this.row=e}},{key:"equals",value:function(e){return e.getColumn()===this.getColumn()&&e.getRow()===this.getRow()}},{key:"compareRows",value:function(e){return e.getRow()===this.getRow()?0:e.getRow()<this.getRow()?1:-1}},{key:"compareColumns",value:function(e){return e.getColumn()===this.getColumn()?0:e.getColumn()<this.getColumn()?1:-1}},{key:"getRow",value:function(){return this.row}},{key:"getColumn",value:function(){return this.column}},{key:"toList",value:function(){return[this.row,this.column]}}]),e}(),f=i(15),m=i(8),p=i.n(m),b=i(14);!function(e){e[e.UP=0]="UP",e[e.DOWN=1]="DOWN",e[e.LEFT=2]="LEFT",e[e.RIGHT=3]="RIGHT"}(d||(d={}));var j=d,k=function(){function e(){Object(l.a)(this,e),this.cmp=void 0,this.length=void 0,this.data=void 0,this.cmp=function(e,t){return e-t},this.length=0,this.data=[]}return Object(h.a)(e,[{key:"insert",value:function(e,t){this.data.push(new y(e,t));for(var i,n,s=this.data.length-1;s>0&&(i=s-1>>>1,this.cmp(this.data[s].getPriority(),this.data[i].getPriority())<0);)n=this.data[i],this.data[i]=this.data[s],this.data[s]=n,s=i;this.length+=1}},{key:"peek",value:function(){throw new Error("Method not implemented.")}},{key:"pop",value:function(){var e=this.data.pop(),t=this.data[0];if(this.data.length>0){this.data[0]=e;for(var i,n,s,o,r=0,a=this.data.length-1;n=(i=1+(r<<1))+1,s=r,i<=a&&this.cmp(this.data[i].getPriority(),this.data[s].getPriority())<0&&(s=i),n<=a&&this.cmp(this.data[n].getPriority(),this.data[s].getPriority())<0&&(s=n),s!==r;)o=this.data[s],this.data[s]=this.data[r],this.data[r]=o,r=s}else t=e;return this.length--,t.getData()}},{key:"size",value:function(){return this.length}},{key:"isEmpty",value:function(){return 0===this.length}},{key:"setStrategy",value:function(e){"max"===e?this.cmp=function(e,t){return e-t}:"min"===e&&(this.cmp=function(e,t){return-1*(e-t)})}}]),e}(),y=function(){function e(t,i){Object(l.a)(this,e),this.data=void 0,this.priority=void 0,this.data=t,this.priority=i}return Object(h.a)(e,[{key:"getData",value:function(){return this.data}},{key:"getPriority",value:function(){return this.priority}}]),e}(),x=function(){function e(){Object(l.a)(this,e)}return Object(h.a)(e,null,[{key:"getNeighboursWithoutSnake",value:function(t,i){return e.allDirections.map((function(i){return e.applyDirection(t,i)})).filter((function(t){return e.isValidPositionWithoutSnake(t,i)}))}},{key:"getDirection",value:function(t,i){var n=this;return e.allDirections.filter((function(e){return n.applyDirection(t,e).equals(i)})).pop()}},{key:"isValidPosition",value:function(e,t,i){return!(e.getRow()<0||e.getRow()>=t[0]||e.getColumn()<0||e.getColumn()>=t[1]||i.isBody(e)||i.isHead(e))}},{key:"isValidPositionWithoutSnake",value:function(e,t){return!(e.getRow()<0||e.getRow()>=t[0]||e.getColumn()<0||e.getColumn()>=t[1])}},{key:"applyDirection",value:function(e,t){switch(t){case j.UP:return new v(e.getRow()-1,e.getColumn());case j.LEFT:return new v(e.getRow(),e.getColumn()-1);case j.RIGHT:return new v(e.getRow(),e.getColumn()+1);default:return new v(e.getRow()+1,e.getColumn())}}},{key:"getPositionID",value:function(e,t){return t[1]*e.getRow()+e.getColumn()}}]),e}();x.allDirections=[j.UP,j.DOWN,j.LEFT,j.RIGHT];var w=function(){function e(){Object(l.a)(this,e),this.moves=[],this.game=void 0,this.visualize=!0,this.visualizationSpeed=5}return Object(h.a)(e,[{key:"init",value:function(){console.info("[Player] A* player")}},{key:"setGame",value:function(e){this.game=e}},{key:"changeVisualize",value:function(){this.visualize=!this.visualize,this.visualize||this.game.getBoard().current.clearVisualization()}},{key:"getNextMove",value:function(){var e=Object(b.a)(p.a.mark((function e(){var t=this;return p.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(0!==this.moves.length){e.next=3;break}return this.visualize&&this.game.getBoard().current.clearVisualization(),e.abrupt("return",this.computeNextPath().then((function(e){return t.moves=e,0===t.moves.length?t.getMoveToSurvive():t.moves.pop()})));case 3:return e.abrupt("return",new Promise((function(e,i){return e(t.moves.pop())})));case 4:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"getMoveToSurvive",value:function(){var e=this,t=x.allDirections.filter((function(t){var i=x.applyDirection(e.game.getHeadSnakePosition(),t);return x.isValidPosition(i,e.game.getDimensions(),e.game.getSnake())}));return t?t.pop():j.DOWN}},{key:"computeNextPath",value:function(){var e,t,i=this,n=[],s=O.createAStarNode(this.game.getHeadSnakePosition(),0,0,null),o=null,r=this.game.getApplePosition(),a=new Set,c=new k;return c.setStrategy("max"),c.insert(s,s.getPriority()),new Promise(function(){var u=Object(b.a)(p.a.mark((function u(l,h){var d,g,v,m,b,j;return p.a.wrap((function(u){for(;;)switch(u.prev=u.next){case 0:if(c.isEmpty()){u.next=45;break}if(!(s=c.pop()).getPosition().equals(r)){u.next=28;break}if(d=i.reconstructPath(s),n=d.map((function(e){return e.direction})),!i.visualize){u.next=28;break}g=Object(f.a)(d),u.prev=7,m=p.a.mark((function e(){var t;return p.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=v.value,i.visualize){e.next=4;break}return i.game.getBoard().current.clearVisualization(),e.abrupt("return","break");case 4:return e.next=6,new Promise((function(e){return setTimeout((function(){!i.game.getApplePosition().equals(t.nextPosition)&&i.visualize?e(i.game.setSinglePosition(t.nextPosition,["path"])):e()}),10*i.visualizationSpeed)}));case 6:case"end":return e.stop()}}),e)})),g.s();case 10:if((v=g.n()).done){u.next=17;break}return u.delegateYield(m(),"t0",12);case 12:if("break"!==u.t0){u.next=15;break}return u.abrupt("break",17);case 15:u.next=10;break;case 17:u.next=22;break;case 19:u.prev=19,u.t1=u.catch(7),g.e(u.t1);case 22:return u.prev=22,g.f(),u.finish(22);case 25:return u.next=27,new Promise((function(e){return setTimeout((function(){e()}),100*i.visualizationSpeed)}));case 27:return u.abrupt("break",45);case 28:if(o=i.getPositionID(s.getPosition()),!a.has(o)){u.next=31;break}return u.abrupt("continue",0);case 31:if(a.add(o),!i.visualize){u.next=35;break}return u.next=35,new Promise((function(e){return setTimeout((function(){i.visualize?e(1):i.game.getBoard().current.clearVisualization()}),.1*i.visualizationSpeed)}));case 35:e=i.getNeighbours(s.getPosition()).filter((function(e){return!a.has(i.getPositionID(e))})),b=p.a.mark((function n(o){var a;return p.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(t=e[o],a=O.createAStarNode(t,i.getDistance(t,r),s.getCost()+1,s),c.insert(a,a.getPriority()),!i.visualize){n.next=6;break}return n.next=6,new Promise((function(e){return setTimeout((function(){return e(i.game.setSinglePosition(a.getPosition(),["expanded"]))}),.1*i.visualizationSpeed)}));case 6:case"end":return n.stop()}}),n)})),j=0;case 38:if(!(j<e.length)){u.next=43;break}return u.delegateYield(b(j),"t2",40);case 40:j++,u.next=38;break;case 43:u.next=0;break;case 45:return u.abrupt("return",l(n));case 46:case"end":return u.stop()}}),u,null,[[7,19,22,25]])})));return function(e,t){return u.apply(this,arguments)}}())}},{key:"getDistance",value:function(e,t){return Math.abs(e.getRow()-t.getRow())+Math.abs(e.getColumn()-t.getColumn())}},{key:"getPositionID",value:function(e){return this.game.getDimensions()[1]*e.getRow()+e.getColumn()}},{key:"getNeighbours",value:function(e){var t=this;return x.allDirections.map((function(t){return x.applyDirection(e,t)})).filter((function(e){return x.isValidPosition(e,t.game.getDimensions(),t.game.getSnake())}))}},{key:"reconstructPath",value:function(e){if(null===e)return[];for(var t=[];null!==e.getParentNode();)t.push({direction:x.getDirection(e.getParentNode().getPosition(),e.getPosition()),nextPosition:e.getParentNode().getPosition()}),e=e.getParentNode();return t}}]),e}(),O=function(){function e(t,i,n,s){Object(l.a)(this,e),this.position=void 0,this.heuristicValue=void 0,this.cost=void 0,this.parentNode=void 0,this.position=t,this.cost=i,this.heuristicValue=n,this.parentNode=s}return Object(h.a)(e,[{key:"getPosition",value:function(){return this.position}},{key:"getPriority",value:function(){return this.heuristicValue+this.cost}},{key:"getHeuristicValue",value:function(){return this.heuristicValue}},{key:"getCost",value:function(){return this.cost}},{key:"getParentNode",value:function(){return this.parentNode}}],[{key:"createAStarNode",value:function(t,i,n,s){return new e(t,i,n,s)}}]),e}(),S=function(){function e(){Object(l.a)(this,e),this.nextMove=void 0,this.game=void 0}return Object(h.a)(e,[{key:"init",value:function(){console.info("[Player] Hamiltonian player")}},{key:"setGame",value:function(e){this.game=e,this.nextMove=new Map,this.computeHamiltonianPath()}},{key:"computeHamiltonianPath",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:new Set,i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[new v(0,0)],n=i.pop(),s=x.getPositionID(n,this.game.getDimensions());if(console.log("Row: ".concat(n.getRow(),"  Column: ").concat(n.getColumn())),0===i.length&&this.nextMove.size===this.game.getDimensions().reduce(Math.imul)-1)return n;if(t.has(s))return new v(-1,-1);var o=x.getNeighboursWithoutSnake(n,this.game.getDimensions()).filter((function(i){return!t.has(x.getPositionID(i,e.game.getDimensions()))}));if(t.add(s),0!==o.length){var r,a=Object(f.a)(o);try{for(a.s();!(r=a.n()).done;){var c=r.value;i.push(c);var u=this.computeHamiltonianPath(t,i);if(-1!==u.getRow())return this.nextMove.set(s,x.getDirection(n,u)),n}}catch(h){a.e(h)}finally{a.f()}return t.delete(s),new v(-1,-1)}if(0===i.length)return t.delete(s),new v(-1,-1);var l=this.computeHamiltonianPath(t,i);return-1!==l.getRow()?(this.nextMove.set(s,x.getDirection(n,l)),n):(t.delete(s),new v(-1,-1))}},{key:"changeVisualize",value:function(){}},{key:"getNextMove",value:function(){var e=Object(b.a)(p.a.mark((function e(){var t=this;return p.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,i){var n=x.getPositionID(t.game.getHeadSnakePosition(),t.game.getDimensions());e(t.nextMove.get(n))})));case 1:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()},{key:"getNeighbours",value:function(e){var t=this;return x.allDirections.map((function(t){return x.applyDirection(e,t)})).filter((function(e){return x.isValidPosition(e,t.game.getDimensions(),t.game.getSnake())}))}}]),e}(),P={ArrowDown:j.DOWN,ArrowUp:j.UP,ArrowLeft:j.LEFT,ArrowRight:j.RIGHT},N={ArrowDown:j.UP,ArrowUp:j.DOWN,ArrowLeft:j.RIGHT,ArrowRight:j.LEFT},C=function(){function e(){Object(l.a)(this,e),this.move=j.DOWN,this.game=void 0}return Object(h.a)(e,[{key:"init",value:function(){var e=this;document.addEventListener("keydown",(function(t){switch(t.key){case"ArrowDown":case"ArrowRight":case"ArrowUp":case"ArrowLeft":e.game.getLastMovement()===N[t.key]&&1!==e.game.getSnakeLength()||(e.move=P[t.key],e.game.isSnakeMoving()||e.game.resume());break;case"p":if(e.game.isSnakeMoving())return console.log("pausing"),void e.game.pause();e.game.resume()}}),!1)}},{key:"changeVisualize",value:function(){}},{key:"setGame",value:function(e){this.game=e}},{key:"getNextMove",value:function(){var e=this;return new Promise((function(t,i){return t(e.move)}))}}]),e}(),M=function(){function e(t){if(Object(l.a)(this,e),this.position=void 0,this.nextNode=void 0,this.previousNode=void 0,this.tail=void 0,t.length){var i=t.pop();this.setPosition(i),this.nextNode=new e(t),this.nextNode.previousNode=this,this.tail=this.nextNode.getTail()}this.tail=this,this.nextNode=null}return Object(h.a)(e,[{key:"getPosition",value:function(){return this.position}},{key:"getNextNode",value:function(){return this.nextNode}},{key:"getTail",value:function(){return this.tail}},{key:"setPosition",value:function(e){this.position=e}},{key:"setNextNode",value:function(e){this.nextNode=e,null!=e?(this.nextNode.setPreviousNode(this),this.tail=this.nextNode.getTail()):this.tail=this}},{key:"setPreviousNode",value:function(e){this.previousNode=e}},{key:"move",value:function(t,i){if(i){var n=new e([this.getPosition()]);return n.setNextNode(this.nextNode),this.setNextNode(n),void this.setPosition(t)}if(this.nextNode){var s=new e([this.getPosition()]);return s.setNextNode(this.nextNode),this.setNextNode(s),this.setPosition(t),this.getTail().getPreviousNode().setNextNode(null),void this.updateTail()}this.setPosition(t),this.tail=this}},{key:"getPreviousNode",value:function(){return this.previousNode}},{key:"updateTail",value:function(){null!=this.nextNode?(this.nextNode.updateTail(),this.tail=this.nextNode.getTail()):this.tail=this}}]),e}(),A=function(){function e(t,i,n){var s=this;Object(l.a)(this,e),this.bodySet=new Set,this.snake=void 0,this.rows=void 0,this.columns=void 0,this.rows=t,this.columns=i,n.forEach((function(e){return s.bodySet.add(e.getRow()*s.columns+e.getColumn())})),this.snake=new M(n)}return Object(h.a)(e,[{key:"isBody",value:function(e){return this.bodySet.has(e.getRow()*this.columns+e.getColumn())}},{key:"move",value:function(e,t){var i=this.snake.getPosition(),n=x.applyDirection(i,e),s=n.equals(t),o=this.snake.getTail().getPosition();if(!s){var r=this.snake.getTail().getPosition().getRow()*this.columns+this.snake.getTail().getPosition().getColumn();if(this.bodySet.delete(r),!x.isValidPosition(n,[this.rows,this.columns],this))throw new Error("Collision")}this.bodySet.add(n.getRow()*this.columns+n.getColumn()),this.snake.move(n,s);var a=[];return this.getSize()>1&&a.push(i),a.push(n),s||a.push(o),{appleEaten:s,affectedPositions:a}}},{key:"getSize",value:function(){return this.bodySet.size}},{key:"isHead",value:function(e){return this.snake.getPosition().equals(e)}},{key:"getHeadPosition",value:function(){return this.snake.getPosition()}}]),e}(),R=function(){function e(t,i,n,s,o,r,a){Object(l.a)(this,e),this.board=void 0,this.scoreBoard=void 0,this.applePosition=void 0,this.rows=void 0,this.columns=void 0,this.snake=void 0,this.lastMovement=void 0,this.isMoving=void 0,this.keepMoving=void 0,this.speedControl=void 0,this.speed=void 0,this.score=void 0,this.steps=void 0,this.gameCount=0,this.player=void 0,this.setIsGameOver=void 0,this.rows=t,this.columns=i,this.board=s,this.scoreBoard=o,this.speed=n/10,this.player=r,this.setIsGameOver=a,this.initializeGame()}return Object(h.a)(e,[{key:"initializeGame",value:function(){this.gameCount>1&&this.clearInterval(),this.player.init(),this.player.setGame(this);var e=this.getRandomInitialPosition();this.snake=new A(this.rows,this.columns,[e]),this.applePosition=this.getRandomApplePosition(),this.score=0,this.lastMovement=null,this.isMoving=!1,this.gameCount+=1,this.setInitialColors()}},{key:"resetInterval",value:function(){var e=this;this.speedControl=window.setTimeout((function(){e.keepMoving=window.requestAnimationFrame((function(){e.isMoving&&e.move()}))}),this.speed)}},{key:"clearInterval",value:function(){clearTimeout(this.speedControl),window.cancelAnimationFrame(this.keepMoving)}},{key:"setSpeed",value:function(e){this.speed=e}},{key:"getPlayer",value:function(){return this.player}},{key:"setPlayer",value:function(e){switch(this.pause(),e){case g.HUMAN:this.player=new C;break;case g.HAMILTONIANCYCLE:this.player=new S;break;default:this.player=new w}this.initializeGame()}},{key:"getRandomApplePosition",value:function(){for(var e=Math.floor(Math.random()*(this.rows-1)),t=Math.floor(Math.random()*(this.columns-1)),i=new v(e,t);this.snake.isBody(i)||this.snake.isHead(i);)e=Math.floor(Math.random()*this.rows),t=Math.floor(Math.random()*this.columns),i.setRow(e),i.setColumn(t);return i}},{key:"move",value:function(){var e=this;this.player.getNextMove().then((function(t){e.isMoving=!0;var i=e.snake.move(t,e.applePosition);e.setLastMovement(t),e.scoreBoard.current.increaseSteps(),i.appleEaten&&(e.scoreBoard.current.increaseScore(),e.score+=1,e.applePosition=e.getRandomApplePosition(),i.affectedPositions.push(e.applePosition)),i.affectedPositions.forEach((function(t){return e.setSinglePosition(t)})),e.resetInterval()})).catch((function(t){console.log(t),e.clearInterval(),e.scoreBoard.current.saveGame(),e.setIsGameOver(!0)}))}},{key:"getRandomInitialPosition",value:function(){return new v(Math.floor(Math.random()*(this.rows-this.rows/2))+Math.floor(this.rows/4),Math.floor(Math.random()*(this.columns-this.columns/2))+Math.floor(this.columns/4))}},{key:"getBoard",value:function(){return this.board}},{key:"getSnakeLength",value:function(){return this.snake.getSize()}},{key:"getLastMovement",value:function(){return this.lastMovement}},{key:"setLastMovement",value:function(e){this.lastMovement=e}},{key:"isSnakeMoving",value:function(){return this.isMoving}},{key:"getApplePosition",value:function(){return this.applePosition}},{key:"pause",value:function(){this.clearInterval(),this.isMoving=!1}},{key:"resume",value:function(){this.isMoving||(this.resetInterval(),this.isMoving=!0)}},{key:"getScore",value:function(){return this.score}},{key:"getSteps",value:function(){return this.steps}},{key:"getDimensions",value:function(){return[this.rows,this.columns]}},{key:"setBoard",value:function(e){this.board=e}},{key:"getSnake",value:function(){return this.snake}},{key:"setSinglePosition",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];this.getApplePosition().equals(e)?t.push("apple"):(this.snake.isBody(e)&&t.push("body"),this.snake.isHead(e)&&t.push("head")),1&e.getRow()?t.push(1&e.getColumn()?"dark-cell":"light-cell"):t.push(1&e.getColumn()?"light-cell":"dark-cell"),this.board.current.setPosition(e,t)}},{key:"setInitialColors",value:function(){for(var e=0;e<this.rows;e++)for(var t=0;t<this.columns;t++)this.setSinglePosition(new v(e,t))}},{key:"getHeadSnakePosition",value:function(){return this.snake.getHeadPosition()}}]),e}(),D=(i(33),i(34),i(0));var T=function(e){return Object(D.jsxs)("div",{className:"game-over-info-container",children:[Object(D.jsx)("div",{className:"game-over-info-title",children:e.title}),Object(D.jsx)("div",{className:"game-over-info-content",children:e.content})]})};var I=function(e){return Object(D.jsx)("div",{className:"game-over-infos-container",children:e.children})};var L=function(e){return e.show?Object(D.jsx)("div",{className:"game-over-modal",children:Object(D.jsxs)("div",{className:"game-over-container",children:[Object(D.jsx)("div",{className:"game-over-title",children:Object(D.jsx)("p",{children:"GAME OVER"})}),Object(D.jsxs)(I,{children:[Object(D.jsx)(T,{title:"Algorithm",content:"Human"}),Object(D.jsx)(T,{title:"Score",content:"20"}),Object(D.jsx)(T,{title:"Avg Steps",content:"20"})]}),Object(D.jsx)("div",{style:{height:"1px",width:"80%",marginTop:"2vh",backgroundColor:"rgb(51, 51, 51)"}}),Object(D.jsxs)("div",{className:"game-over-options",children:[Object(D.jsx)("button",{className:"reset table game-over-button",onClick:function(){e.clearScoreBoard()},children:Object(D.jsx)("i",{className:"fas fa-undo-alt"})}),Object(D.jsx)("button",{className:"resume game-over-button",onClick:function(){e.restartGameCallback()},children:Object(D.jsx)("i",{className:"fas fa-2x fa-play-circle"})}),Object(D.jsx)("button",{className:"reset home game-over-button",onClick:function(){e.restartGameCallback()},children:Object(D.jsx)("i",{className:"fas fa-home"})})]})]})}):null},z=i(12),H=i(11),E=(i(36),function(e){Object(z.a)(i,e);var t=Object(H.a)(i);function i(e){var n;return Object(l.a)(this,i),(n=t.call(this,e)).id=0,n.state=n.getInitialState(e.algorithm),n}return Object(h.a)(i,[{key:"clearScoreBoard",value:function(){this.setState((function(e){return{firstScore:{id:0,algorithm:e.firstScore.algorithm.toString(),score:e.firstScore.score,stepCount:e.firstScore.stepCount,avgSteps:Math.round(100*(e.firstScore.stepCount/(e.firstScore.score+1)+Number.EPSILON))/100},scoreList:[]}}))}},{key:"getInitialState",value:function(e){return{firstScore:{id:0,algorithm:e.toString(),score:0,stepCount:0,avgSteps:-1},scoreList:[]}}},{key:"getNewState",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;return{firstScore:{id:this.state.firstScore.id+e,algorithm:this.state.firstScore.algorithm.toString(),score:0,stepCount:0,avgSteps:-1},scoreList:this.state.scoreList}}},{key:"setAlgorithm",value:function(e){var t=null;switch(e){case g.HUMAN:(t=this.getNewState()).algorithm="Human",this.setState(t);break;case g.HAMILTONIANCYCLE:(t=this.getNewState()).algorithm="Hamiltonian",this.setState(t);break;default:(t=this.getNewState()).algorithm="A*",this.setState(t)}}},{key:"increaseScore",value:function(){this.setState((function(e){return{firstScore:{id:e.firstScore.id,algorithm:e.firstScore.algorithm.toString(),score:e.firstScore.score+1,stepCount:e.firstScore.stepCount,avgSteps:Math.round(100*(e.firstScore.stepCount/(e.firstScore.score+1)+Number.EPSILON))/100},scoreList:e.scoreList}}))}},{key:"increaseSteps",value:function(){this.setState((function(e){return{firstScore:{id:e.firstScore.id,algorithm:e.firstScore.algorithm.toString(),score:e.firstScore.score,stepCount:e.firstScore.stepCount+1,avgSteps:e.firstScore.avgSteps},scoreList:e.scoreList}}))}},{key:"saveGame",value:function(){var e=this;this.setState((function(t){return{firstScore:e.getNewState(1).firstScore,scoreList:[t.firstScore].concat(t.scoreList)}}))}},{key:"render",value:function(){return Object(D.jsx)("div",{className:"score-board-summary-table-container",children:Object(D.jsxs)("table",{className:"score-board-summary-table",children:[Object(D.jsx)("thead",{children:Object(D.jsxs)("tr",{children:[Object(D.jsx)("td",{children:"GAME ID"}),Object(D.jsx)("td",{children:"ALGORITHM"}),Object(D.jsx)("td",{children:"SCORE"}),Object(D.jsx)("td",{children:"STEPS"}),Object(D.jsx)("td",{children:"AVG STEPS"})]})}),Object(D.jsxs)("tbody",{children:[Object(D.jsxs)("tr",{children:[Object(D.jsx)("td",{children:"#".concat(this.state.firstScore.id)}),Object(D.jsx)("td",{children:this.state.firstScore.algorithm}),Object(D.jsx)("td",{children:this.state.firstScore.score}),Object(D.jsx)("td",{children:this.state.firstScore.stepCount}),Object(D.jsx)("td",{children:this.state.firstScore.avgSteps})]}),this.state.scoreList.map((function(e){return Object(D.jsxs)("tr",{children:[Object(D.jsx)("td",{children:"#".concat(e.id)}),Object(D.jsx)("td",{children:e.algorithm}),Object(D.jsx)("td",{children:e.score}),Object(D.jsx)("td",{children:e.stepCount}),Object(D.jsx)("td",{children:e.avgSteps})]})}))]})]})})}}]),i}(o.a.Component));i(37);var B=function(e){return Object(D.jsxs)("div",{style:{flex:"1",width:"100%",padding:"10px 20px",display:"flex",justifyContent:"space-evenly",backgroundColor:"rgba(255,255,255,0.50)",position:"relative"},children:[Object(D.jsxs)("div",{className:"select-algorithm ",children:[Object(D.jsx)("h3",{children:"Select Speed"}),Object(D.jsx)("input",{type:"range",min:"1",max:"1000",defaultValue:"500",onChange:function(t){return e.setSpeed(1e3-t.currentTarget.valueAsNumber)}})]}),Object(D.jsxs)("div",{className:"select-algorithm ",children:[Object(D.jsx)("h3",{children:"Visualize"}),Object(D.jsx)("input",{type:"checkbox",defaultChecked:!0,onChange:function(t){e.changeVisualize()}})]}),Object(D.jsxs)("div",{className:"select-algorithm",children:[Object(D.jsx)("h3",{children:"Algorithm"}),Object(D.jsxs)("label",{className:"setting-algorithm-radio-container",children:["Human",Object(D.jsx)("input",{type:"radio",name:"radio",defaultChecked:!0,onChange:function(t){"on"===t.currentTarget.value&&e.setAlgorithm(g.HUMAN)}}),Object(D.jsx)("span",{className:"checkmark"})]}),Object(D.jsxs)("label",{className:"setting-algorithm-radio-container",children:["A*",Object(D.jsx)("input",{type:"radio",name:"radio",onChange:function(t){"on"===t.currentTarget.value&&e.setAlgorithm(g.ASTAR)}}),Object(D.jsx)("span",{className:"checkmark"})]})]}),Object(D.jsx)("div",{className:"instructions",children:"Press ENTER to start playing"})]})},V=(i(38),function(e){Object(z.a)(i,e);var t=Object(H.a)(i);function i(e){var n;return Object(l.a)(this,i),(n=t.call(this,e)).state={classNames:e.classNames},n}return Object(h.a)(i,[{key:"changeColor",value:function(e){this.setState({classNames:e})}},{key:"render",value:function(){return Object(D.jsx)("div",{className:this.state.classNames.join(" ")})}}]),i}(o.a.Component)),G=function(e){Object(z.a)(i,e);var t=Object(H.a)(i);function i(e){var n;return Object(l.a)(this,i),(n=t.call(this,e)).rows=void 0,n.columns=void 0,n.boardSquares=void 0,n.boardProps=void 0,n.rows=e.rows,n.columns=e.columns,n.state={score:0,length:1},n.initializeBoard(),n}return Object(h.a)(i,[{key:"initializeBoard",value:function(){this.boardSquares=new Array(this.rows),this.boardProps=new Array(this.rows);for(var e=0;e<this.rows;e++){this.boardSquares[e]=new Array(this.columns),this.boardProps[e]=new Array(this.columns);for(var t=0;t<this.columns;t++)this.boardProps[e][t]={classNames:["light-cell"]},this.boardSquares[e][t]=o.a.createRef()}}},{key:"setPosition",value:function(e,t){this.boardProps[e.getRow()][e.getColumn()].classNames=t,this.boardSquares[e.getRow()][e.getColumn()].current.changeColor(t)}},{key:"clearVisualization",value:function(){for(var e=0;e<this.rows;e++)for(var t=0;t<this.columns;t++){var i=this.boardProps[e][t].classNames.filter((function(e){return"expanded"!==e})).filter((function(e){return"explored"!==e}));i.length!==this.boardProps[e][t].classNames.length&&this.setPosition(new v(e,t),i)}}},{key:"displayBoard",value:function(){var e=this;return this.boardProps.flatMap((function(t,i){return t.map((function(t,n){return Object(D.jsx)(V,Object(c.a)({ref:e.boardSquares[i][n]},t),[i,n].join("-"))}))}))}},{key:"render",value:function(){return console.log("Rendering Board"),Object(D.jsx)("div",{className:"grid",style:{gridTemplate:"repeat(".concat(this.rows,", 1fr) /repeat(").concat(this.columns,",1fr)")},children:this.displayBoard()})}}]),i}(o.a.Component),q=(i(39),{rows:21,columns:21,speed:500}),U=o.a.createRef(),F=o.a.createRef(),W=null;function Y(e){console.debug("Changin Player ".concat(e)),W.setPlayer(e)}function J(){console.debug("Changing visualize"),W.getPlayer().changeVisualize()}function K(e){console.debug("Changing speed ".concat(e)),W.setSpeed(e)}var Q=function(){var e=Object(s.useState)(!1),t=Object(u.a)(e,2),i=t[0],n=t[1];return Object(s.useEffect)((function(){window.addEventListener("keydown",(function(e){"Enter"===e.key&&W.resume()}))})),Object(s.useEffect)((function(){null===W?W=new R(21,21,500,U,F,new C,n):W.setBoard(U)}),[]),Object(D.jsxs)("div",{style:{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"100vh",width:"100vw",backgroundColor:"#578A34"},children:[Object(D.jsxs)("div",{className:"container",children:[Object(D.jsxs)("div",{style:{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",height:"100%",width:"100%",backgroundColor:"rgba(255,255,255,0.30)"},children:[Object(D.jsx)("div",{style:{display:"flex",top:"1em",width:"100%",backgroundColor:"rgba(255,255,255,0.60)",justifyContent:"center",alignContent:"center"},children:Object(D.jsx)("h1",{style:{fontFamily:"Black Ops One, cursive",flex:8,textAlign:"center"},children:"Snake Game AI"})}),Object(D.jsx)(E,{ref:F,algorithm:g.HUMAN}),Object(D.jsx)(B,{setAlgorithm:Y,setSpeed:K,changeVisualize:J})]}),Object(D.jsx)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",height:"100%",width:"100%"},children:Object(D.jsx)(G,Object(c.a)({ref:U},q))})]}),Object(D.jsx)(L,{show:i,restartGameCallback:function(){n(!1),W.initializeGame()},clearScoreBoard:function(){F.current.clearScoreBoard()}})]})};var X=function(){return Object(D.jsx)(Q,{})},Z=i(23),$=i(4);var _=function(e){return Object(D.jsxs)(D.Fragment,{children:[Object(D.jsx)("h1",{children:"Welcome to my Snake-AI visualizer project"}),Object(D.jsx)("p",{children:"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Unde, delectus? Aperiam ipsa quidem maiores, aut consectetur at? Voluptatum, magni? Saepe incidunt nihil deserunt vitae error ad sequi dolorem quia harum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur sed dolorum fugit iste et vitae ratione repellat animi incidunt ut aut asperiores quasi consectetur numquam nesciunt voluptas neque, recusandae hic."})]})};var ee=function(){return Object(D.jsx)(Z.a,{children:Object(D.jsx)("div",{children:Object(D.jsxs)($.c,{children:[Object(D.jsx)($.a,{path:"/info",component:_}),Object(D.jsx)($.a,{path:"/",component:X})]})})})},te=function(e){e&&e instanceof Function&&i.e(3).then(i.bind(null,49)).then((function(t){var i=t.getCLS,n=t.getFID,s=t.getFCP,o=t.getLCP,r=t.getTTFB;i(e),n(e),s(e),o(e),r(e)}))};a.a.render(Object(D.jsx)(o.a.StrictMode,{children:Object(D.jsx)(ee,{})}),document.getElementById("root")),te()}},[[48,1,2]]]);
//# sourceMappingURL=main.41c06f10.chunk.js.map