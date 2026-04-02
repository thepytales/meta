// Zentrales Grabber-Skript für alle Objekte
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
        let target = intersectEl.closest('.grabbable');
        
        if (target) {
            this.grabbedEntity = target;
            this.el.object3D.attach(this.grabbedEntity.object3D);
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

// Fidget Spinner: Reagiert auf A/X Button des zweiten Controllers
AFRAME.registerComponent('spinable', {
    init: function () {
        this.spinVelocity = 0;
        this.friction = 0.99;
        
        // Hört auf Button-Events der Controller (A-Taste oder X-Taste)
        window.addEventListener('abuttondown', () => { this.spinVelocity += 15; });
        window.addEventListener('xbuttondown', () => { this.spinVelocity += 15; });
    },
    tick: function (time, timeDelta) {
        if (this.spinVelocity > 0.01) {
            this.el.object3D.rotation.y += this.spinVelocity * (timeDelta / 1000);
            this.spinVelocity *= this.friction;
        }
    }
});

// Stress-Ball: Realistisches Quetschen
AFRAME.registerComponent('squishable', {
    init: function () {
        this.isSqueezed = false;
        this.handRotation = new THREE.Euler();
        this.el.addEventListener('grabbed', (evt) => { 
            this.isSqueezed = true; 
            this.handRotation.copy(evt.detail.handEl.object3D.rotation);
        });
        this.el.addEventListener('released', () => { this.isSqueezed = false; });
    },
    tick: function () {
        const currentScale = this.el.getAttribute('scale') || {x: 1, y: 1, z: 1};
        let targetScale = {x: 1, y: 1, z: 1};
        if (this.isSqueezed) {
            this.el.object3D.rotation.set(this.handRotation.x, this.handRotation.y, this.handRotation.z + Math.PI / 2);
            targetScale = {x: 1.3, y: 1.3, z: 0.5};
        }
        this.el.setAttribute('scale', {
            x: currentScale.x + (targetScale.x - currentScale.x) * 0.15,
            y: currentScale.y + (targetScale.y - currentScale.y) * 0.15,
            z: currentScale.z + (targetScale.z - currentScale.z) * 0.15
        });
    }
});