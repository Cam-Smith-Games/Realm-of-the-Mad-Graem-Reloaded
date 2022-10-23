import { Game } from "./game/game.js";

(async function() {
    const game = new Game();
    await game.load();
    game.start();

    console.log(game);
})();
