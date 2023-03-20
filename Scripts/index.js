// Script for index.html //
"use strict";

class NavigationHandler {
    #currentIndex;
    #navigation;
    #navigationItems;
    #acontentItems;

    enableNavItem(index) {
        if (index === this.#currentIndex) // Is the navigation item already enabled?
            return; // If so, do nothing

        // Deactivate the current navigation item and enable the one on index
        this.#navigationItems[this.#currentIndex].classList.remove("nav-active");
        this.#navigationItems[index].classList.add("nav-active");
        
        // Update the current index
        this.#currentIndex = index;
    }

    constructor() {
        this.#currentIndex = 0;
        this.#navigation = document.querySelector("aside");
        this.#navigationItems = this.#navigation.firstElementChild.children;
        this.#acontentItems = document.getElementById("acontent").children;

        Array.from(this.#navigationItems).forEach((item, index) => {
            item.onclick = () => {
                this.enableNavItem(index);
                this.#acontentItems[index].scrollIntoView({behavior: "smooth"});
            }
        });
    }

    destroy() {
        this.#navigationItems.forEach((item) => {
            item.onclick = null;
        });
    }
};

class IndexIntersectionObserver {
    #observer;
    #navigationHandler;

    #handleEntry(entry) {
        const {target} = entry;
        const {dataset} = target;
        if (entry.intersectionRatio >= (+dataset.intersectionratio)) {
            let actions = Array.from(dataset.intersectionactions);
            for (let actionsIndex = 0; actionsIndex < actions.length; ++actionsIndex) {
                switch (actions[actionsIndex]) {
                case '0':
                    this.#navigationHandler.enableNavItem(+dataset.navigationindex);
                    break;
                case '1':
                    target.classList.add("intersection-animate");
                    actions.splice(actionsIndex, 1); // Remove the action because animation is only executed once
                    break;
                }
            }
        }
    }

    constructor() {
        this.#navigationHandler = new NavigationHandler;

        this.#observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    this.#handleEntry(entry);
                });
            }, {threshold: [0, 0.25, 0.5, 0.75, 1]}
        );

        Array.from(document.getElementsByClassName("intersection-observe")).forEach((element) => {
            this.#observer.observe(element);
        });
    }

    destroy() {
        this.#observer.disconnect();
    }
};


class IndexHandler {
    #acontent;
    #moreaboutme;
    #intersectionObserver;
    #welcomePage;
    #content;

    #typeEffect = (string, duration, element) => {
        let index = 0;
        const stringLength = string.length;
        let interval = setInterval(() => {
            element.textContent += string[index++];
            if (index === stringLength)
                clearInterval(interval);
            }, duration / stringLength);
        };

    popstateHandler(data) {
        this.#welcomePage.classList.add("hide");
        this.#content.classList.add("show");
        this.#acontent.scroll(0, data.scrollY);
    }

    saveState() {
        window.history.pushState({scrollY: this.#acontent.scrollTop}, null);
    }

    constructor() {
        this.#acontent = document.getElementById("acontent");
        
        this.#welcomePage = document.getElementById("welcome-page");
        this.#content = document.getElementById("content");
        
        this.#typeEffect("Welcome", 750, this.#welcomePage.firstElementChild);

        const clickListener = () => {
            this.#welcomePage.classList.add("hide");
            this.#content.classList.add("show");
            document.body.removeEventListener("click", clickListener);
        }
        
        document.body.addEventListener("click", clickListener);
        
        this.#moreaboutme = document.getElementById("moreaboutme");
        this.#moreaboutme.onclick = () => {
            god.loadPage(null, "about");
        }

        this.#intersectionObserver = new IndexIntersectionObserver;
    }


    destroy() {
        this.#moreaboutme.onclick = null;
        this.#intersectionObserver.destroy();
    }
};
