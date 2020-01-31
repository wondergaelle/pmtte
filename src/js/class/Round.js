import { buffs } from '../data/buffs';
import { sounds } from '../data/sounds';
import toastr from 'toastr';

export default class Round {
    constructor(players, round) {
        this.players = players;
        this.currentRound = round || 1;
        this.elConsole = document.getElementById('console');
        this.currentPlayer = 0;
        this.maxPlayerScore = 100;

        // Auto-initialisation de l'objet
        this.init();
    }

    init() {
        for (let player = 0; player < this.players.length; ++player) {
            this.players[player].reset();
        }

        // On affiche dans l'élément HTML #console le round courant
        this.elConsole.innerHTML = '<h2>Round ' + this.currentRound + '<br><span class="currentPlayer"></span></h2>';

        this.elCurrentPlayer = this.elConsole.querySelector('.currentPlayer');

        // Lancement du tour du premier joueur
        this.turn();
    }

    turn() {
        this.elCurrentPlayer.innerText = 'New turn for ' + this.players[this.currentPlayer].name + '!';
        this.players[this.currentPlayer].elPush.style.display = 'block';
        this.players[this.currentPlayer].setTime();

        // On appel la méthode applyBuff de chaque player si ce n'est le 1er Round
        if (this.currentRound > 1) {
            this.players[this.currentPlayer].applyBuff();

            if (this.players[this.currentPlayer].buff.bonus) {
                sounds.buff.play();
            }
            else {
                sounds.debuff.play();
            }
        }

        this.players[this.currentPlayer].elPush.addEventListener('mouseup', this.endTurn.bind(this));
    }

    endTurn() {
        if (this.players[this.currentPlayer] === undefined) return;

        this.players[this.currentPlayer].elPush.style.display = 'none';

        this.players[this.currentPlayer].pointsLoad(this.maxPlayerScore);


        if (this.players[++this.currentPlayer] !== undefined) {
            this.turn();
        } else {
            this.endRound();
        };
    }

    endRound() {
        let self = this,
            winner = null;

        for (let player = 0; player < this.players.length; ++player) {
            let score = this.players[player].score;

            if (score >= this.maxPlayerScore) {
                winner = this.players[player];
                break;
            }
        }

        if (winner !== null) {
            this.elConsole.innerHTML = '<h2>' + winner.name + ' won the game!<br>See you next time assholes.</h2><button class="reload btn btn--bordered">New game!</button>';

            winner.animate('bounce', '1s', 'linear', '0s', 'infinite');

            for (let player = 0; player < this.players.length; ++player) {
                if (this.players[player] !== winner) {
                    this.players[player].animate('fadeOutDown', '1s', 'linear', '0s', '1', 'normal', 'forwards');
                }
            }

            this.elConsole.querySelector('.reload').addEventListener('click', function () {
                document.location.reload();
            });
        }
        else {
            // Initialisation du prochain Round
            ++this.currentRound;
            this.elConsole.innerHTML = '<button class="next btn btn--bordered">Round ' + this.currentRound + '</button>';

            this.elConsole.querySelector('.next').addEventListener('click', function () {
                toastr.clear();

                // Ajoute un buff ou un debuff sur chaque joueur
                for (let player = 0; player < self.players.length; ++player){
                    console.log('player buff : ' + player);
                    let currentBuff = Math.round(Math.random() * (buffs.length - 1));
                    self.players[player].buff = buffs[currentBuff];
                }

                // On lance un nouveau Round
                new Round(self.players, self.currentRound);
            });
        }



    }
}