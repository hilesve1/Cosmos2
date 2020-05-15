window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


window.onload = function () {
    const WINDOW = {
        LEFT: -10,
        BOTTOM: -10,
        WIDTH: 20,
        HEIGHT: 20,
        CENTER: new Point(0, 0, -30), // центр окошка, через которое видим мир
        CAMERA: new Point(0, 0, -50) // точка, из которой смотрим на мир
    };
    const ZOOM_OUT = 1.1;
    const ZOOM_IN = 0.9;

    const sur = new Surfaces;
    const canvas = new Canvas({
        width: 650, 
        height: 650,
        WINDOW, callbacks: { wheel, mousemove, mouseup, mousedown, mouseleave}});
    const graph3D = new Graph3D({ WINDOW });
    const ui = new UI({canvas, callbacks: {move, printPoints, printEdges, printPolygons}});

    const SCENE = [
        
        sur.sphera(40, 7, new Point(0, 0, 0),'#FFA500'),
        sur.sphera(40,1, new Point(0, -10, 0),'#FFE4B5', { rotateOz : new Point}),
        sur.sphera(40, 1, new Point(-13, 0, 0),'#FF8C00', { rotateOz : new Point}),
        sur.sphera(40,3, new Point(0, 21, 0),'#00BFFF', { rotateOz : new Point}),
        sur.sphera(40,2.5, new Point(30, 0, 0),'#FF4500', { rotateOz : new Point}),
        sur.sphera(40,4.7, new Point(0,-41 , 0),'#DEB887', { rotateOz : new Point}),
        sur.sphera(40, 4, new Point(-54, 0, 0),'#CD853F', { rotateOz : new Point}),
        sur.bublik(40, 8, new Point(-54, 0, 0),'#CD853F', { rotateOz : new Point} ),
        sur.sphera(40,3.3, new Point(0, 72, 0),'#AFEEEE', { rotateOz : new Point}),
        sur.sphera(40,3.3 , new Point(80, 0, 0),'#00FFFF', { rotateOz : new Point}),
       
        
    ]; 

    const LIGHT = new Light(0, 0, 0,600); // источник света

    let canRotate = false; 
    let canPrint = {
        points: false,
        edges: false,
        polygons: true
    }

    // about callbacks
    function wheel(event) {
        const delta = (event.wheelDelta > 0) ? ZOOM_IN : ZOOM_OUT;
        SCENE.forEach(subject => {
            subject.points.forEach(point => graph3D.zoom(delta, point));
            if (subject.animation){
                for (let key in subject.animation) {
                     graph3D.zoom(delta, subject.animation[key]);
                }
               
            }
        });
    }

    function mouseup() {
        canRotate = false;
    }

    function mouseleave() {
        mouseup();
    }

    function mousedown() {
        canRotate = true;
    }

    function mousemove(event) {
        if (canRotate) {
            if (event.movementX) {
                const alpha = canvas.sx(event.movementX) / WINDOW.CENTER.z;
                SCENE.forEach(subject => {
                    subject.points.forEach(point => graph3D.rotateOy(alpha, point));
                if (subject.animation){
                    for (let key in subject.animation) {
                         graph3D.rotateOy(alpha, subject.animation[key]);
                    }
                   
                }
             });
            }
            if (event.movementY) {
                const alpha = canvas.sy(event.movementY) / WINDOW.CENTER.z;
                SCENE.forEach(subject => {
                    subject.points.forEach(point => graph3D.rotateOx(alpha, point));
                    if (subject.animation){
                        for (let key in subject.animation) {
                             graph3D.rotateOx(alpha, subject.animation[key]);
                        }
                       
                    }
                });
            }    
        }
    };

    function printPoints(value) {
        canPrint.points = value;
    };

    function printEdges(value) {
        canPrint.edges = value;
    }

    function printPolygons(value) {
        canPrint.polygons = value;
    };


    function move(direction) {
        if (direction == 'up' || direction == 'down') {
            const delta = (direction === 'up') ? 0.1 : -0.1;
            SCENE.forEach(subject => subject.points.forEach(point => graph3D.moveOy(delta, point)));
        }
        if (direction == 'left' || direction == 'right') {
            const delta = (direction === 'right') ? 0.1 : -0.1;
            SCENE.forEach(subject => subject.points.forEach(point => graph3D.moveOx(delta, point)));
        }
    }


    function printAllPolygons(){
        // print polygons
        if (canPrint.polygons) {

            const polygons = [];

            SCENE.forEach(subject => {
                // Отсечь невидимые грани
                //graph3D.calcGorner(subject, WINDOW.CAMERA);

                // алгоритм художника
                graph3D.calcDistance(subject, WINDOW.CAMERA, 'distance');
                subject.polygons.sort((a, b) => b.distance - a.distance);
                graph3D.calcDistance(subject, LIGHT, 'lumen');
                // отрисовка полигонов
                for (let i = 0; i < subject.polygons.length; i++) {
                    if (subject.polygons[i].visible) {
                        const polygon = subject.polygons[i];
                        const point1 = {x: graph3D.xs(subject.points[polygon.points[0]]), y: graph3D.ys(subject.points[polygon.points[0]])};
                        const point2 = {x: graph3D.xs(subject.points[polygon.points[1]]), y: graph3D.ys(subject.points[polygon.points[1]])};
                        const point3 = {x: graph3D.xs(subject.points[polygon.points[2]]), y: graph3D.ys(subject.points[polygon.points[2]])};
                        const point4 = {x: graph3D.xs(subject.points[polygon.points[3]]), y: graph3D.ys(subject.points[polygon.points[3]])};
                        let {r, g, b} = polygon.color;
                        const lumen = graph3D.calcIllumination(polygon.lumen, LIGHT.lumen);
                        r = Math.round(r * lumen);
                        g = Math.round(g * lumen);
                        b = Math.round(b * lumen);
                        polygons.push({
                            points: [point1, point2, point3, point4],
                            color: polygon.rgbToHex(r, g, b),
                            distance: polygon.distance
                        });
                    }
                }
            });
            // отрисовка всех полигонов
            polygons.sort((a, b) => b.distance - a.distance);
            polygons.forEach(polygon => canvas.polygon(polygon.points, polygon.color));
        }
    }

  

    function printSubject(subject) {
        
                   
        // print edges
        if (canPrint.edges) {
            for (let i = 0; i < subject.edges.length; i++) {
                const edges = subject.edges[i];
                const point1 = subject.points[edges.p1];
                const point2 = subject.points[edges.p2];
                canvas.line(graph3D.xs(point1), graph3D.ys(point1), graph3D.xs(point2), graph3D.ys(point2), "#66f400");
            }
        }          
        // print points
        if (canPrint.points) {
            for (let i = 0; i < subject.points.length; i++) {
                const points = subject.points[i];
                canvas.point(graph3D.xs(points), graph3D.ys(points));
            }
        }    
    }

    function render() {
        canvas.clear();
        printAllPolygons();
        SCENE.forEach(subject => printSubject(subject));
        canvas.text(-9, 9, "FPS: " + FPSout);
        
    }
    
    function animation(){
    //закрутим фигуры
    SCENE.forEach(subject => {
        if(subject.animation){
            
            for (let key in subject.animation){
                //center
                    const { x, y, z } = subject.animation[key];
                    const xn = WINDOW.CENTER.x - x;
                    const yn = WINDOW.CENTER.y - y;
                    const zn = WINDOW.CENTER.z - z;
                    //переместить центр объекта в центр координат
                    subject.points.forEach(point => graph3D.move(xn,  yn,  zn, point));
                    // повращать объект 
                    const alpha = Math.PI / 180;
                    subject.points.forEach(point => graph3D[key](alpha, point));
                    //переместить центр объекта после вращения обратно
                    subject.points.forEach(point => graph3D.move(-xn,  -yn,  -zn, point));

              
        }
        
    }
         
        });     
}

setInterval(animation, 20);



    let FPS = 0;
    let FPSout = 0;
    timestamp = (new Date).getTime();
    (function animloop() {
        // Считаем FPS
        FPS++;
        const currentTimestamp = (new Date).getTime();
        if (currentTimestamp - timestamp >= 1000) {
            timestamp = currentTimestamp;
            FPSout = FPS;
            FPS = 0;

        }

        // рисуем сцену
        render();
        requestAnimFrame(animloop);
    })();
}; 
