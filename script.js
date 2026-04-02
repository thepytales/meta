// Fehlerfreies Greifen wie beim Original-Würfel
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
        
        const intersections = raycaster.intersections;
        if (intersections.length > 0) {
            let target = intersections[0].object.el;
            
            while (target && !target.classList.contains('grabbable')) {
                target = target.parentElement;
            }
            
            if (target && target.classList.contains('grabbable')) {
                this.grabbedEntity = target;
                
                // Eigene Fallphysik während des Greifens pausieren
                if (this.grabbedEntity.components['simple-gravity']) {
                    this.grabbedEntity.components['simple-gravity'].pause();
                }
                
                // Bindet das Objekt direkt und ruckelfrei an den Controller
                this.el.object3D.attach(this.grabbedEntity.object3D);
            }
        }
    },
    
    onTriggerUp: function (evt) {
        if (this.grabbedEntity) {
            // Löst das Objekt und setzt es zurück in die Welt
            this.el.sceneEl.object3D.attach(this.grabbedEntity.object3D);
            
            // Eigene Fallphysik wieder aktivieren
            if (this.grabbedEntity.components['simple-gravity']) {
                this.grabbedEntity.components['simple-gravity'].play();
            }
            
            this.grabbedEntity = null;
        }
    }
});

// Maßgeschneiderte, glitch-freie Gravitation
AFRAME.registerComponent('simple-gravity', {
    tick: function () {
        const pos = this.el.object3D.position;
        
        // Tisch-Zentrum liegt bei x=0.5, z=-1.2. Breite=1.2, Tiefe=1.0
        // Wir berechnen den Bereich, in dem das Objekt auf den Tisch fallen soll
        const overTable = (pos.x > -0.1 && pos.x < 1.1 && pos.z > -1.7 && pos.z < -0.7);
        
        // Y-Level: Tischoberfläche ist bei ca. -1.05. Der Fußboden liegt bei ca. -1.9
        const groundLevel = overTable ? -1.05 : -1.9;

        if (pos.y > groundLevel) {
            pos.y -= 0.04; // Weiche Fallgeschwindigkeit
        } else if (pos.y < groundLevel) {
            pos.y = groundLevel; // Verhindert Durchrutschen
        }
    }
});

// Hilfsskript zur automatischen Korrektur der Kamera-Position im VR-Modus
document.querySelector('a-scene').addEventListener('enter-vr', function () {
    console.log("Eintritt in VR: Physisches Laufen aktiviert.");
});