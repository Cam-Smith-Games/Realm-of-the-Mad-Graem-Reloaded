export class Sound {

    sound: HTMLAudioElement;

    constructor(src:string) {
        this.sound = document.createElement("audio");
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        this.sound.volume = 0.2;
        document.body.appendChild(this.sound);
        this.sound.src = src;
    }

    async load():Promise<Sound> {

        return new Promise((resolve,_) => {
            this.sound.oncanplaythrough = () => {
                resolve(this);
                this.sound.oncanplaythrough = null;
            };
        })
    }


    play(currentTime?:number) {
        this.sound.currentTime = typeof currentTime === "number" ? currentTime : 0;
        this.sound.play();
    }
    stop() {
        this.sound.pause();
    }
}