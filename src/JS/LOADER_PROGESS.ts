// TypeScript conversion of LOADER_PROGESS
class LoaderScreen {
    private div: HTMLElement | null = null;
    private progressBar: HTMLProgressElement | null = null;

    on_start(): void {
        this.div = document.getElementById("loader");
        this.progressBar = document.querySelector("div#loader progress");
        
        const nodes = document.body.childNodes;
        nodes.forEach((node) => {
            if (node.nodeName === "CANVAS" || node.nodeName === "DIV") {
                (node as HTMLElement).style.display = "none";
            }
        });
        
        if (this.div) {
            this.div.style.display = "";
            this.div.style.width = innerWidth + "px";
            this.div.style.height = innerHeight + "px";
        }
    }

    on_done(): void {
        const nodes = document.body.childNodes;
        nodes.forEach((node) => {
            if (node.nodeName === "CANVAS" || node.nodeName === "DIV") {
                (node as HTMLElement).style.display = "";
            }
        });
        
        if (this.div) {
            this.div.style.display = "none";
            this.div.remove();
        }
    }

    on_done_texture(): void {
        const nodes = document.body.childNodes;
        nodes.forEach((node) => {
            if (node.nodeName === "CANVAS" || node.nodeName === "DIV") {
                (node as HTMLElement).style.display = "";
            }
        });
        
        if (this.div) {
            this.div.style.display = "none";
            this.div.remove();
        }
    }

    on_progess(progress: number): void {
        console.log('Progress:', progress, "%");
        if (this.progressBar) {
            this.progressBar.value = progress * 100;
        }
    }
}

// Export as global for legacy compatibility
const LOADER_SCREEN = new LoaderScreen();
(window as any).LOADER_SCREEN = LOADER_SCREEN;





