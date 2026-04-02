// Grabber-Update: Muss 'click'-Events für das Andrehen durchlassen
AFRAME.registerComponent('grabber', {
    init: function () {
        this.onTriggerDown = this.onTriggerDown.bind(this);
        this.onTriggerUp = this.onTriggerUp.bind(this);
        
        this.el.addEventListener('triggerdown', this.onTriggerDown);
        this.el.addEventListener('triggerup', this.onTriggerUp);
        
        this.grabbedEntity = null;
    },
    
    onTriggerDown: function (evt) {
        const raycaster = this.el.components.raycaster;
        if (!raycaster) return;
        
        // WICHTIG: Raycaster muss 'spinable' Objekte ignorieren, wenn wir greifen wollen.
        // Die 'spinable' Komponente regelt das Andrehen über Standard-A-Frame 'click' Events.
        const intersections = raycaster.intersections;
        
        if (intersections.length > 0) {
            let target = intersections[0].object.el;
            
            while (target && !target.classList.contains('grabbable')) {
                target = target.parentElement;
            }
            
            // Verhindert das Greifen, wenn es bereits angestoßen wird (click)
            if (target && target.classList.contains('grabbable')) {
                this.grabbedEntity = target;
                this.el.object3D.attach(this.grabbedEntity.object3D);
            }
        }
    },
    
    onTriggerUp: function (evt) {
        if (this.grabbedEntity) {
            this.el.sceneEl.object3D.attach(this.grabbedEntity.object3D);
            this.grabbedEntity = null;
        }
    }
});

// Code-basierte Fidget Spinner Logik (ohne Physik-Engine)
AFRAME.registerComponent('spinable', {
    init: function () {
        this.spinVelocity = 0; // Aktuelle Drehgeschwindigkeit
        this.friction = 0.985;  // Dämpfung (je niedriger, desto schneller stoppt er)
        this.spinImpulse = 25;  // Kraft eines Stoßes
        
        // Registriert das Andrehen über den Raycaster (click/triggerdown)
        this.el.addEventListener('click', this.onSpinImpulse.bind(this));
    },
    
    onSpinImpulse: function (evt) {
        // Fügt Drehgeschwindigkeit hinzu (Impuls)
        this.spinVelocity += this.spinImpulse;
    },
    
    tick: function (time, timeDelta) {
        // timeDelta in Sekunden umrechnen für konsistente Animation
        const deltaSeconds = timeDelta / 1000;
        
        // Rotation anwenden (um die Y-Achse)
        this.el.object3D.rotation.y += this.spinVelocity * deltaSeconds;
        
        // Reibung anwenden: Geschwindigkeit dämpfen
        this.spinVelocity *= this.friction;
        
        // Kleiner Schwellenwert, um Berechnungen zu stoppen, wenn er fast steht
        if (Math.abs(this.spinVelocity) < 0.01) {
            this.spinVelocity = 0;
        }
    }
});

// Hilfsskript zur automatischen Korrektur der Kamera-Position im VR-Modus
document.querySelector('a-scene').addEventListener('enter-vr', function () {
    console.log("Eintritt in VR: Physisches Laufen aktiviert.");
});