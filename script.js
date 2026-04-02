// Komponente zum Greifen und Verschieben von Objekten mit Quest-Controllern
AFRAME.registerComponent('grabber', {
    init: function () {
        this.onTriggerDown = this.onTriggerDown.bind(this);
        this.onTriggerUp = this.onTriggerUp.bind(this);
        
        // Event-Listener für den Trigger des Quest-Controllers
        this.el.addEventListener('triggerdown', this.onTriggerDown);
        this.el.addEventListener('triggerup', this.onTriggerUp);
        
        this.grabbedEntity = null;
    },
    
    onTriggerDown: function (evt) {
        const raycaster = this.el.components.raycaster;
        if (!raycaster) return;
        
        const intersections = raycaster.intersections;
        if (intersections.length > 0) {
            // Findet das getroffene Element
            let target = intersections[0].object.el;
            
            // Suche in der Elternstruktur nach der Klasse .grabbable
            while (target && !target.classList.contains('grabbable')) {
                target = target.parentElement;
            }
            
            if (target && target.classList.contains('grabbable')) {
                this.grabbedEntity = target;
                // Verknüpft das Objekt direkt mit dem Controller
                this.el.object3D.attach(this.grabbedEntity.object3D);
            }
        }
    },
    
    onTriggerUp: function (evt) {
        if (this.grabbedEntity) {
            // Löst das Objekt vom Controller und platziert es wieder in der Szene
            this.el.sceneEl.object3D.attach(this.grabbedEntity.object3D);
            this.grabbedEntity = null;
        }
    }
});

// Hilfsskript zur automatischen Korrektur der Kamera-Position im VR-Modus
document.querySelector('a-scene').addEventListener('enter-vr', function () {
    console.log("Eintritt in VR: Physisches Laufen aktiviert.");
});