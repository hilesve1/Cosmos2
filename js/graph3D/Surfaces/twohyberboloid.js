Surfaces.prototype.twohyberboloid = (count = 20, a = 10, b = 10, c = 10, point = new Point(0 , 0, 0)) => {
    let points = [];
    let edges = [];
    let polygons = [];

    // точки
    const delta = Math.PI  * 2 / count;
    for (let i = 0; i <= Math.PI; i += delta) {
        for (let j = 0; j < Math.PI * 2; j += delta) {
            const x = point.x + a * Math.sinh(i) * Math.cos(j);
            const y = point.y + a * Math.sinh(i) * Math.sin(j);
            const z = point.z + c * Math.cosh(i);  
            points.push(new Point(x, y, z));
        }
    } 
    
    for (let i = 0; i <= Math.PI; i += delta) {
        for (let j = 0; j < Math.PI * 2; j += delta) {
            const x = point.x + a * Math.sinh(i) * Math.cos(j);
            const y = point.y + a * Math.sinh(i) * Math.sin(j);
            const z = (point.z - 10) + (-c) * Math.cosh(i);  
            points.push(new Point(x, y, z));
        }
    }  

    // ребра 
    for (let i = 0; i < points.length; i++) {
        // вдоль
        if (i + 1 < points.length && (i + 1) % count !== 0) {
            edges.push(new Edge(i, i + 1));
        } else if ((i + 1) % count === 0) {
            edges.push(new Edge(i, i + 1 - count));
        }
        // поперёк
        if (i + count < points.length) {
            edges.push(new Edge(i, i + count));
        }
    }

    // полигоны
    for (let i = 0; i < points.length; i++) {
        if (i + 1 + count < points.length && (i + 1) % count !== 0) {
            polygons.push(new Polygon([i, i + 1, i + 1 + count, i + count],));
        } else if ((i + count) < points.length && (i + 1) % count === 0) {
            polygons.push(new Polygon([i, i + 1 - count, i + 1, i + count],))
        }
    }

    return new Subject(points, edges, polygons);
}