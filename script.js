// Grabber-Update: Nutzt closest() für garantierte Greifbarkeit von Gruppen
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
        if (!raycaster || raycaster.intersections.length === 0) return;
        
        let intersectEl = raycaster.intersections[0].object.el;
        // FIND-FIX: closest() findet zuverlässig die .grabbable Eltern-Entity, auch in Gruppen
        let target = intersectEl.closest('.grabbable');
        
        if (target) {
            this.grabbedEntity = target;
            this.el.object3D.attach(this.grabbedEntity.object3D);
            // Sagt dem Ball, welche Hand ihn gegriffen hat
            this.grabbedEntity.emit('grabbed', { handEl: this.el });
        }
    },
    onTriggerUp: function (evt) {
        if (this.grabbedEntity) {
            this.grabbedEntity.emit('released');
            this.el.sceneEl.object3D.attach(this.grabbedEntity.object3D);
            this.grabbedEntity = null;
        }
    }
});

// Fidget Spinner Logik
AFRAME.registerComponent('spinable', {
    init: function () {
        this.spinVelocity = 0;
        this.friction = 0.985;
        this.el.addEventListener('click', () => { this.spinVelocity += 20; });
    },
    tick: function (time, timeDelta) {
        this.el.object3D.rotation.y += this.spinVelocity * (timeDelta / 1000);
        this.spinVelocity *= this.friction;
    }
});

// Stress-Ball Logik: Quetscht realistisch gegen die Handfläche
AFRAME.registerComponent('squishable', {
    init: function () {
        this.isSqueezed = false;
        this.handRotation = new THREE.Euler();
        
        this.el.addEventListener('grabbed', (evt) => { 
            this.isSqueezed = true; 
            // Kopiert die aktuelle Hand-Rotation, um den Ball relativ flach zu quetschen
            this.handRotation.copy(evt.detail.handEl.object3D.rotation);
        });
        
        this.el.addEventListener('released', () => { 
            this.isSqueezed = false; 
        });
    },
    tick: function () {
        const currentScale = this.el.getAttribute('scale') || {x: 1, y: 1, z: 1};
        let targetScale = {x: 1, y: 1, z: 1};

        if (this.isSqueezed) {
            // SQUISH-FIX: Wir drehen den Ball lokal gegen die Hand und quetschen die Z-Achse (Tiefe)
            // Die Hand-Rotation wird übernommen, plus eine kleine Korrektur
            this.el.object3D.rotation.set(this.handRotation.x, this.handRotation.y, this.handRotation.z + Math.PI / 2);
            // Wir quetschen flach (Z) und verbreitern (X, Y)
            targetScale = {x: 1.3, y: 1.3, z: 0.5}; 
        }

        this.el.setAttribute('scale', {
            x: currentScale.x + (targetScale.x - currentScale.x) * 0.15,
            y: currentScale.y + (targetScale.y - currentScale.y) * 0.15,
            z: currentScale.z + (targetScale.z - currentScale.z) * 0.15
        });
    }
});

// Sanduhr Logik
AFRAME.registerComponent('sand-timer', {
    init: function () {
        this.sandLevel = 1.0; 
        this.sandEl = this.el.querySelector('#sand');
    },
    tick: function (time, timeDelta) {
        const rotation = this.el.object3D.rotation;
        const isUpsideDown = Math.abs(rotation.x) > Math.PI / 2 || Math.abs(rotation.z) > Math.PI / 2;
        
        if (isUpsideDown && this.sandLevel > 0) {
            this.sandLevel -= 0.001 * (timeDelta / 16); 
        } else if (!isUpsideDown && this.sandLevel < 1.0) {
             this.sandLevel += 0.001 * (timeDelta / 16); 
        }

        this.sandEl.setAttribute('scale', {x: 1, y: this.sandLevel, z: 1});
        const offset = (1 - this.sandLevel) * 0.09;
        this.sandEl.setAttribute('position', {x: 0, y: isUpsideDown ? offset : -offset, z: 0});
    }
});

// Spezial-Logik für den Fidget Spinner
AFRAME.registerComponent('spinable', {
    init: function () {
        this.spinVelocity = 0;
        this.friction = 0.99; // Etwas weniger Reibung für längeres Drehen
        // 'click' wird vom Raycaster ausgelöst, wenn man den Trigger drückt
        this.el.addEventListener('click', () => { 
            this.spinVelocity += 15; 
        });
    },
    tick: function (time, timeDelta) {
        if (this.spinVelocity > 0.1) {
            this.el.object3D.rotation.y += this.spinVelocity * (timeDelta / 1000);
            this.spinVelocity *= this.friction;
        }
    }
});

// Spezial-Logik für die Sanduhr
AFRAME.registerComponent('sand-timer', {
    init: function () {
        this.sandLevel = 1.0; 
        this.sandEl = this.el.querySelector('#sand');
    },
    tick: function (time, timeDelta) {
        // Wir prüfen die Welt-Rotation der Sanduhr
        const worldRotation = new THREE.Quaternion();
        this.el.object3D.getWorldQuaternion(worldRotation);
        const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(worldRotation);
        
        // Wenn der "Up"-Vektor nach unten zeigt, läuft der Sand
        const isUpsideDown = upVector.y < 0;
        
        const speed = 0.0005 * timeDelta; 
        if (isUpsideDown && this.sandLevel > 0) {
            this.sandLevel -= speed;
        } else if (!isUpsideDown && this.sandLevel < 1.0) {
            this.sandLevel += speed;
        }

        // Clip auf 0 bis 1
        this.sandLevel = Math.max(0, Math.min(1, this.sandLevel));

        // Visuelles Update des Sand-Zylinders
        this.sandEl.setAttribute('scale', {x: 1, y: this.sandLevel, z: 1});
        const offset = (1 - this.sandLevel) * 0.09;
        this.sandEl.setAttribute('position', {x: 0, y: isUpsideDown ? offset : -offset, z: 0});
    }
});

// VR-Init Logik
document.querySelector('a-scene').addEventListener('enter-vr', function () {
    console.log("VR-Modus gestartet.");
});