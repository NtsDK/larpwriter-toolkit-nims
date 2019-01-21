//"use strict";
//
//(function(exports){
//
////    var cameraInitPos = new THREE.Vector3(-30, 40, 30).multiplyScalar(2.5);
////    var cameraInitPos = new THREE.Vector3(0, 40, 40).multiplyScalar(2.5);
////    var cameraInitPos = new THREE.Vector3(0, 0, 40).multiplyScalar(2.5);
//    var cameraInitPos = new THREE.Vector3(0, 0, 60).multiplyScalar(2.5);
//    var basicZScale = 25;
//    var spotLightInitPos = new THREE.Vector3(0, 0, 50);
//
//    // three.js
//    var camera;
//    var scene;
//    var renderer;
//    var controls;
//    var stats;
//
//    function initStats() {
//        var stats = new Stats();
//        stats.setMode(0); // 0: fps, 1: ms
//        U.addEl(U.clearEl(U.queryEl("#Stats-output")), stats.domElement);
//        return stats;
//    };
//
//    function init(){
//        // create a render and set the size
//        renderer = new THREE.WebGLRenderer();
//        renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
//        U.addEl(U.clearEl(U.queryEl("#WebGL-output")), renderer.domElement);
//
//        stats = initStats();
//
//        controls = new function () {
//            this.rotationSpeed = 0.08;
////            this.bouncingSpeed = 0.03;
//            this.zScale = basicZScale;
//            this.planeScale = 10;
//            this.cameraZ = 120;
////            this.cameraRotX = 0;
////            this.cameraRotY = 0;
////            this.cameraRotZ = 0;
//
//            this.outputObjects = function () {
//                console.log(scene.children);
//            }
//        };
//
//
//        var gui = new dat.GUI({ autoPlace: false });
//        gui.add(controls, 'rotationSpeed', 0, 0.5);
////        gui.add(controls, 'bouncingSpeed', 0, 0.5);
//        gui.add(controls, 'zScale', 1, 100);
//        gui.add(controls, 'planeScale', 1, 100);
//        gui.add(controls, 'cameraZ', -500, 500);
////        gui.add(controls, 'cameraRotX', -1, 1);
////        gui.add(controls, 'cameraRotY', -1, 1);
////        gui.add(controls, 'cameraRotZ', -1, 1);
//
//        gui.add(controls, 'outputObjects');
//
//        U.addEl(U.queryEl('#gui-settings-output'), gui.domElement);
//    //    renderer.shadowMapEnabled = true;
//    };
//
//    var isFirstRefresh = true;
//
//    // once everything is loaded, we run our Three.js stuff.
//    function refresh(network, nodes, edges, eventDetails, metaInfo) {
//
//        var lowerTimeBoundary = new Date(metaInfo.preGameDate).getTime();
//        var upperTimeBoundary = new Date(metaInfo.date).getTime();
//        var timeDiff = upperTimeBoundary - lowerTimeBoundary;
//        console.log(lowerTimeBoundary);
//        console.log(upperTimeBoundary);
//        console.log(timeDiff);
//
//        var characterEvents = {};
//        var storyEvents = {};
//        eventDetails.forEach(function(eventInfo){
//            if(eventInfo.time === ''){
//                eventInfo.time = metaInfo.date;
//            }
//            eventInfo.scaledTime = (new Date(eventInfo.time).getTime() - lowerTimeBoundary) / timeDiff;
//            console.log(eventInfo.scaledTime);
//            storyEvents[eventInfo.storyName] = storyEvents[eventInfo.storyName] || {events: []};
//            storyEvents[eventInfo.storyName].events.push(eventInfo);
//            eventInfo.characters.forEach(function(character){
//                characterEvents[character] = characterEvents[character] || {events: []};
//                characterEvents[character].events.push(eventInfo);
//            });
//        });
//        console.log(storyEvents);
//        console.log(characterEvents);
//        function fillMinMax(objInfo){
//            objInfo.minTime = R.reduce(R.min, Infinity, objInfo.events.map(R.prop('scaledTime')));
//            objInfo.maxTime = R.reduce(R.max, -Infinity, objInfo.events.map(R.prop('scaledTime')));
//        }
//        R.values(storyEvents).forEach(fillMinMax);
//        R.values(characterEvents).forEach(fillMinMax);
//        console.log(storyEvents);
//        console.log(characterEvents);
//
//        var sizes = updateRendererSize();
////        if(isFirstRefresh){
//        // create a scene, that will hold all our elements such as objects, cameras and lights.
//        scene = new THREE.Scene();
//
//        // create a camera, which defines where we're looking at.
//        camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
//
////        var orbitControls = new THREE.OrbitControls(camera);
//////        orbitControls.autoRotate = true;
////        var clock = new THREE.Clock();
//
//        // show axes in the screen
//        var axes = new THREE.AxisHelper(20);
//        scene.add(axes);
//
//        // create the ground plane
//        var planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1);
//        var planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0});
//        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
//        //    plane.receiveShadow = true;
//
//        // rotate and position the plane
//        plane.rotation.x = -0.5 * Math.PI;
//        plane.position.x = 15;
//        plane.position.y = 0;
//        plane.position.z = 0;
//
//        // add the plane to the scene
//        scene.add(plane);
//
//        // position and point the camera to the center of the scene
//        camera.position.copy(cameraInitPos);
//        camera.lookAt(new THREE.Vector3(0, 0, 0));
//        camera.position.add(new THREE.Vector3(0, -100, 0));
//        camera.lookAt(new THREE.Vector3(0, 0, 0));
////        camera.rotation.z =  Math.PI;
////        camera.lookAt(scene.position);
//
////        camera.rotateOnAxis(cameraInitPos.normalize() , 0.6);
////        camera.rotation.z = 0.75 * Math.PI;
//
////        camera.position.x = -30;
////        camera.position.y = 40;
////        camera.position.z = 30;
//
//        // add subtle ambient lighting
//        var ambientLight = new THREE.AmbientLight(0x0c0c0c);
//        scene.add(ambientLight);
//
//        // add spotlight for the shadows
//        var spotLight = new THREE.SpotLight(0xffffff);
//        spotLight.position.copy(spotLightInitPos);
//        //    spotLight.castShadow = true;
//        scene.add(spotLight);
////            isFirstRefresh = false;
////        }
//
//        // call the render function
//        var step = 0;
//
//        var isInitialized = false;
////        if(isFirstRefresh){
//            render();
////            isFirstRefresh = false;
////        }
////        network.storePositions();
//
//        function getEventInfo(id){
//            if(id.startsWith('St:')){
//                return storyEvents[id.substring(3)];
//            } else {
//                return characterEvents[id];
//            }
//        };
//
//        function render() {
//            stats.update();
//            network.storePositions();
//            if(!isInitialized){
//                console.log(nodes.get());
//                console.log(edges.get());
//                nodes.get().forEach(function(node){
//                    var eventInfo = getEventInfo(node.id);
//
//                    if(eventInfo){
//                        var height = eventInfo.maxTime - eventInfo.minTime;
//                        var z = (eventInfo.maxTime + eventInfo.minTime)/2;
//                        addCylinder(node.x/10,-node.y/10, z*basicZScale, height, 0.5, String('cyl-' + node.id));
////                        addCylinder(0,0,0, 2, 0.5, String('cyl-' + node.id));
////                        addCylinder(node.x/10,-node.y/10, -5, height, 3, String(node.id + '0'));
//                    }
////                    addCylinder(node.x/10,-node.y/10, 4, String(node.id + '1-top'));
//                });
//
//                isInitialized = true;
//            } else {
//                nodes.get().forEach(function(node){
//                    var cyl = scene.getObjectByName(String('cyl-' + node.id));
//                    if(cyl){
//                        cyl.position.x = node.x/10;
//                        cyl.position.y = -node.y/10;
//                    }
////                    cyl = scene.getObjectByName(String(node.id + '1-top'));
////                    cyl.position.x = node.x/10;
////                    cyl.position.y = -node.y/10;
//                });
//            }
//
//            scene.traverse(function (e) {
//                if (e instanceof THREE.Mesh && e.name.startsWith('cyl-')) {
////                    e.position.y = controls.zScale;
//                    var eventInfo = getEventInfo(e.name.substring(4));
////                    if(eventInfo){
//                        e.position.z = (eventInfo.maxTime + eventInfo.minTime)/2 * controls.zScale;
////                        e.setHeight((eventInfo.maxTime - eventInfo.minTime) * controls.zScale);
////                    } else {
////                        console.log(e.name);
////                    }
//                    e.scale.y = controls.zScale;
//                }
//            });
//
//            var nowTime = Date.now();
//            var multip = 0.005;
//            camera.position.x = 50*Math.sin(nowTime*controls.rotationSpeed*multip);
//            camera.position.y = 50*Math.cos(nowTime*controls.rotationSpeed*multip);
//            camera.position.z = controls.cameraZ;
//            camera.lookAt(new THREE.Vector3(0, 0, 0));
////            scene.traverse(function (e) {
////                if (e instanceof THREE.Mesh && e.name.endsWith('1-top')) {
//////                    e.position.y = controls.zScale;
////                    e.position.z = controls.zScale;
////                }
////            });
//
////            var delta = clock.getDelta();
////            orbitControls.update(delta);
//
////            camera.rotateOnAxis(cameraInitPos.normalize() , controls.cameraRotX);
////            camera.rotateOnAxis(camera.getWorldDirection().normalize() , controls.cameraRotX);
////            camera.rotation.copy(new THREE.Vector3(controls.cameraRotX,
////                controls.cameraRotY, controls.cameraRotZ).multiplyScalar(Math.PI));
////            camera.rotation.x = controls.cameraRotX * Math.PI;
//
//            // render using requestAnimationFrame
//            requestAnimationFrame(render);
//            renderer.render(scene, camera);
//        }
//
//    }
//
//    function updateRendererSize(){
//        var styles = getComputedStyle(U.queryEl('#socialNetworkContainer'));
//        var width = styles.width.split('px').join('') * 0.75;
//        var height = styles.height.split('px').join('') * 0.75;
//        renderer.setSize(width, height);
//        return {
//            width: width,
//            height: height,
//        }
//    }
//    function onResize() {
//        if(camera && renderer){
//            var sizes = updateRendererSize();
//            camera.aspect = sizes.width / sizes.height;
//            camera.updateProjectionMatrix();
//        }
//    }
//
//    function addCylinder(x, y, z, height, radius, id) {
//
//        var geometry = new THREE.CylinderGeometry( radius, radius, height, 32 );
//        var material = new THREE.MeshLambertMaterial( {color: 0x7777ff} );
//        var cylinder = new THREE.Mesh( geometry, material );
//        cylinder.name = id;
//
//        cylinder.position.x = x;
//        cylinder.position.y = y;
//        cylinder.position.z = z;
//        cylinder.rotation.x = -0.5 * Math.PI;
////        cylinder.position.y = z;
////        cylinder.position.z = y;
//
//    //    cylinder.position.x = 40;
//
//        scene.add( cylinder );
//
//    };
//
//    exports.init = init;
//    exports.refresh = refresh;
////    window.onload = init;
//
//    // listen to the resize events
//    window.addEventListener('resize', onResize, false);
//
//
//})(this['TimelinedNetwork']={});
