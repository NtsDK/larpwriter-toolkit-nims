"use strict";

(function(exports){

    var cameraInitPos = new THREE.Vector3(-30, 40, 30).multiplyScalar(2.5);
    // three.js
    var camera;
    var scene;
    var renderer;
    var controls;
    var stats;
    
    function initStats() {
        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms
        addEl(clearEl(getEl("Stats-output")), stats.domElement);
        return stats;
    };
    
    function init(){
        // create a render and set the size
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
        addEl(clearEl(getEl("WebGL-output")), renderer.domElement);
        
        stats = initStats();
        
        controls = new function () {
            this.rotationSpeed = 0.02;
            this.bouncingSpeed = 0.03;
            this.zScale = 1;
            this.planeScale = 10;
            
            this.outputObjects = function () {
                console.log(scene.children);
            }
        };
    
        
        var gui = new dat.GUI({ autoPlace: false });
        gui.add(controls, 'rotationSpeed', 0, 0.5);
        gui.add(controls, 'bouncingSpeed', 0, 0.5);
        gui.add(controls, 'zScale', 1, 20);
        gui.add(controls, 'planeScale', 1, 100);
        
        gui.add(controls, 'outputObjects');
        
        addEl(getEl('gui-settings-output'), gui.domElement);
    //    renderer.shadowMapEnabled = true;
    };
    
    var isFirstRefresh = true;
    
    // once everything is loaded, we run our Three.js stuff.
    function refresh(network, nodes, edges) {
        
        updateRendererSize();
//        if(isFirstRefresh){
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        scene = new THREE.Scene();
        
        // create a camera, which defines where we're looking at.
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // show axes in the screen
        var axes = new THREE.AxisHelper(20);
        scene.add(axes);
        
        // create the ground plane
        var planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1);
        var planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0});
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        //    plane.receiveShadow = true;
        
        // rotate and position the plane
        plane.rotation.x = -0.5 * Math.PI;
        plane.position.x = 15;
        plane.position.y = 0;
        plane.position.z = 0;
        
        // add the plane to the scene
        scene.add(plane);
        
        // position and point the camera to the center of the scene
        camera.position.copy(cameraInitPos);
        
//        camera.position.x = -30;
//        camera.position.y = 40;
//        camera.position.z = 30;
        camera.lookAt(scene.position);
        
        // add subtle ambient lighting
        var ambientLight = new THREE.AmbientLight(0x0c0c0c);
        scene.add(ambientLight);
        
        // add spotlight for the shadows
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-40, 60, -10);
        //    spotLight.castShadow = true;
        scene.add(spotLight);
//            isFirstRefresh = false;
//        }
    
        // call the render function
        var step = 0;
    
        var isInitialized = false;
//        if(isFirstRefresh){
            render();
//            isFirstRefresh = false;
//        }
//        network.storePositions();
    
        function render() {
            stats.update();
            network.storePositions();
            if(!isInitialized){
                console.log(nodes.get());
                console.log(edges.get());
                nodes.get().forEach(function(node){
                    addCylinder(node.x/10,node.y/10, 0, String(node.id + '0'));
                    addCylinder(node.x/10,node.y/10, 4, String(node.id + '1-top'));
                });
                
                isInitialized = true;
            } else {
                nodes.get().forEach(function(node){
                    var cyl = scene.getObjectByName(String(node.id + '0'));
                    cyl.position.x = node.x/10;
                    cyl.position.z = node.y/10;
                    cyl = scene.getObjectByName(String(node.id + '1-top'));
                    cyl.position.x = node.x/10;
                    cyl.position.z = node.y/10;
    //                addCylinder(node.x/10,node.y/10, node.id);
                });
            }
            
            scene.traverse(function (e) {
                if (e instanceof THREE.Mesh && e.name.endsWith('1-top')) {
                    e.position.y = controls.zScale;
                }
            });
    
            // render using requestAnimationFrame
            requestAnimationFrame(render);
            renderer.render(scene, camera);
        }
    
    }
    
    function updateRendererSize(){
        var styles = getComputedStyle(getEl('socialNetworkContainer'));
        var width = styles.width.split('px').join('') * 0.75;
        var height = styles.height.split('px').join('') * 0.75;
        renderer.setSize(width, height);
        return {
            width: width,
            height: height,
        }
    }
    function onResize() {
        if(camera && renderer){
            var sizes = updateRendererSize();
            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();
        }
    }
    
    function addCylinder(x, y, z, id) {
        
        var geometry = new THREE.CylinderGeometry( 3, 3, 1, 32 );
        var material = new THREE.MeshLambertMaterial( {color: 0x7777ff} );
        var cylinder = new THREE.Mesh( geometry, material );
        cylinder.name = id;
        
        cylinder.position.x = x;
        cylinder.position.y = z;
        cylinder.position.z = y;
        
    //    cylinder.position.x = 40;
        
        scene.add( cylinder );
    
    };
    
    exports.init = init;
    exports.refresh = refresh;
//    window.onload = init;
    
    // listen to the resize events
    window.addEventListener('resize', onResize, false);
    

})(this['TimelinedNetwork']={});