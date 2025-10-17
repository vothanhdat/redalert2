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
            this.div.style.height = innerHeight + "px"; // Fixed: was incorrectly setting width twice in original
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

    // Note: Same as on_done - kept separate for API compatibility with existing code
    on_done_texture(): void {
        this.on_done();
    }

    on_progress(progress: number): void {
        console.log('Progress:', progress, "%");
        if (this.progressBar) {
            this.progressBar.value = progress * 100;
        }
    }

    // Legacy method name for backward compatibility (typo in original)
    on_progess(progress: number): void {
        this.on_progress(progress);
    }
}

// Export as global for legacy compatibility
const LOADER_SCREEN = new LoaderScreen();
(window as any).LOADER_SCREEN = LOADER_SCREEN;





