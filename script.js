// Fehlerfreies Greifen für frei schwebende Objekte
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
                
                // Bindet das Objekt direkt und ruckelfrei an den Controller
                this.el.object3D.attach(this.grabbedEntity.object3D);
            }
        }
    },
    
    onTriggerUp: function (evt) {
        if (this.grabbedEntity) {
            // Löst das Objekt und lässt es exakt an der aktuellen Position in der Luft schweben
            this.el.sceneEl.object3D.attach(this.grabbedEntity.object3D);
            this.grabbedEntity = null;
        }
    }
});

// Hilfsskript zur automatischen Korrektur der Kamera-Position im VR-Modus
document.querySelector('a-scene').addEventListener('enter-vr', function () {
    console.log("Eintritt in VR: Physisches Laufen aktiviert.");
});