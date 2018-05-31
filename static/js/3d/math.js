/*
 * Richard Franklin (rsfrankl)
 * math.js
 * My Math library that I will build up over time during this course
 */

const Matrix = {
    getIdentity : function(m) {
        let arr = new Float32Array(m*m);
        for(let i = 0; i < m; i++){
            arr[i*m + i] = 1;
        }
        return arr;
    },
    construct : function(m, n) {
        let A = new Array(n);
        for(let i = 0; i < n; i++) {
            A[i] = new Array(m);
        }
        return A;
    },
    rotateX4 : function(radians) {
        let M = new Float32Array(16);
        M[0] = 1;
        M[15] = 1;        
        M[5] = Math.cos(radians);
        M[6] = -Math.sin(radians);
        M[9] = Math.sin(radians);
        M[10] = Math.cos(radians);
        return M;
    },
    rotateY4 : function(radians) {
        let M = new Float32Array(16);
        M[5] = 1;
        M[15] = 1;
        M[0] = Math.cos(radians);
        M[2] = Math.sin(radians);
        M[8] = -Math.sin(radians);
        M[10] = Math.cos(radians);
        return M;
    },
    rotateZ4 : function(radians) {
        let M = new Float32Array(16);
        M[10] = 1;
        M[15] = 1;        
        M[0] = Math.cos(radians);
        M[1] = -Math.sin(radians);
        M[4] = Math.sin(radians);
        M[5] = Math.cos(radians);
        return M;
    },
    // Implementation of Rodrigues' Rotation Formula
    // Takes a vector, vec, and returns a rotation matrix around the vector, vec
    // (This returns the functions in a matrix not actual values)
    getRotation3AsFuncs : function(vec) {
        // aliases
        const cos = Math.cos;
        const sin = Math.sin;
        // empty matrix
        let M = this.construct(3, 3);
        // indexing
        let row, col;

        rc(0,0);
        M[row][col] = theta => {
            return cos(theta) + vec[0]*vec[0]*(1-cos(theta));
        };
        rc(1,0);
        M[row][col] = theta => {
            return vec[2]*sin(theta) + vec[0]*vec[1]*(1-cos(theta));
        };        
        rc(2,0);
        M[row][col] = theta => {
            return -vec[1]*sin(theta) + vec[0]*vec[2]*(1-cos(theta));
        }        
        rc(0,1);
        M[row][col] = theta => {
            return vec[0]*vec[1]*(1-cos(theta)) - vec[2]*sin(theta);
        };        
        rc(1,1);
        M[row][col] = theta => {
            return cos(theta) + vec[1]*vec[1]*(1-cos(theta));
        };        
        rc(2,1);
        M[row][col] = theta => {
            return vec[0]*sin(theta) + vec[1]*vec[2]*(1-cos(theta));
        };        
        rc(0,2);
        M[row][col] = theta => {
            return vec[1]*sin(theta) + vec[0]*vec[2]*(1-cos(theta));
        };        
        rc(1, 2);
        M[row][col] = theta => {
            return -vec[0]*sin(theta) + vec[1]*vec[2]*(1-cos(theta));
        };
        rc(2,2);
        M[row][col] = theta => {
            return cos(theta) + vec[2]*vec[2]*(1-cos(theta));
        };

        return M;

        // quick and readable way to set indicees
        function rc(r = 0, c = 0) {
            row = r;
            col = c;
        }
    },
    invert4 : function(A) {
        let M = new Float32Array(16);
    
        M[0] = A[5]  * A[10] * A[15] - 
                 A[5]  * A[11] * A[14] - 
                 A[9]  * A[6]  * A[15] + 
                 A[9]  * A[7]  * A[14] +
                 A[13] * A[6]  * A[11] - 
                 A[13] * A[7]  * A[10];
    
        M[4] = -A[4]  * A[10] * A[15] + 
                  A[4]  * A[11] * A[14] + 
                  A[8]  * A[6]  * A[15] - 
                  A[8]  * A[7]  * A[14] - 
                  A[12] * A[6]  * A[11] + 
                  A[12] * A[7]  * A[10];
    
        M[8] = A[4]  * A[9] * A[15] - 
                 A[4]  * A[11] * A[13] - 
                 A[8]  * A[5] * A[15] + 
                 A[8]  * A[7] * A[13] + 
                 A[12] * A[5] * A[11] - 
                 A[12] * A[7] * A[9];
    
        M[12] = -A[4]  * A[9] * A[14] + 
                   A[4]  * A[10] * A[13] +
                   A[8]  * A[5] * A[14] - 
                   A[8]  * A[6] * A[13] - 
                   A[12] * A[5] * A[10] + 
                   A[12] * A[6] * A[9];
    
        M[1] = -A[1]  * A[10] * A[15] + 
                  A[1]  * A[11] * A[14] + 
                  A[9]  * A[2] * A[15] - 
                  A[9]  * A[3] * A[14] - 
                  A[13] * A[2] * A[11] + 
                  A[13] * A[3] * A[10];
    
        M[5] = A[0]  * A[10] * A[15] - 
                 A[0]  * A[11] * A[14] - 
                 A[8]  * A[2] * A[15] + 
                 A[8]  * A[3] * A[14] + 
                 A[12] * A[2] * A[11] - 
                 A[12] * A[3] * A[10];
    
        M[9] = -A[0]  * A[9] * A[15] + 
                  A[0]  * A[11] * A[13] + 
                  A[8]  * A[1] * A[15] - 
                  A[8]  * A[3] * A[13] - 
                  A[12] * A[1] * A[11] + 
                  A[12] * A[3] * A[9];
    
        M[13] = A[0]  * A[9] * A[14] - 
                  A[0]  * A[10] * A[13] - 
                  A[8]  * A[1] * A[14] + 
                  A[8]  * A[2] * A[13] + 
                  A[12] * A[1] * A[10] - 
                  A[12] * A[2] * A[9];
    
        M[2] = A[1]  * A[6] * A[15] - 
                 A[1]  * A[7] * A[14] - 
                 A[5]  * A[2] * A[15] + 
                 A[5]  * A[3] * A[14] + 
                 A[13] * A[2] * A[7] - 
                 A[13] * A[3] * A[6];
    
        M[6] = -A[0]  * A[6] * A[15] + 
                  A[0]  * A[7] * A[14] + 
                  A[4]  * A[2] * A[15] - 
                  A[4]  * A[3] * A[14] - 
                  A[12] * A[2] * A[7] + 
                  A[12] * A[3] * A[6];
    
        M[10] = A[0]  * A[5] * A[15] - 
                  A[0]  * A[7] * A[13] - 
                  A[4]  * A[1] * A[15] + 
                  A[4]  * A[3] * A[13] + 
                  A[12] * A[1] * A[7] - 
                  A[12] * A[3] * A[5];
    
        M[14] = -A[0]  * A[5] * A[14] + 
                   A[0]  * A[6] * A[13] + 
                   A[4]  * A[1] * A[14] - 
                   A[4]  * A[2] * A[13] - 
                   A[12] * A[1] * A[6] + 
                   A[12] * A[2] * A[5];
    
        M[3] = -A[1] * A[6] * A[11] + 
                  A[1] * A[7] * A[10] + 
                  A[5] * A[2] * A[11] - 
                  A[5] * A[3] * A[10] - 
                  A[9] * A[2] * A[7] + 
                  A[9] * A[3] * A[6];
    
        M[7] = A[0] * A[6] * A[11] - 
                 A[0] * A[7] * A[10] - 
                 A[4] * A[2] * A[11] + 
                 A[4] * A[3] * A[10] + 
                 A[8] * A[2] * A[7] - 
                 A[8] * A[3] * A[6];
    
        M[11] = -A[0] * A[5] * A[11] + 
                   A[0] * A[7] * A[9] + 
                   A[4] * A[1] * A[11] - 
                   A[4] * A[3] * A[9] - 
                   A[8] * A[1] * A[7] + 
                   A[8] * A[3] * A[5];
    
        M[15] = A[0] * A[5] * A[10] - 
                  A[0] * A[6] * A[9] - 
                  A[4] * A[1] * A[10] + 
                  A[4] * A[2] * A[9] + 
                  A[8] * A[1] * A[6] - 
                  A[8] * A[2] * A[5];
    
        let det = A[0] * M[0] + A[1] * M[4] + A[2] * M[8] + A[3] * M[12];
    
        if (det == 0)
            return Matrix.getIdentity(4);
    
        det = 1.0 / det;
    
        for(let i = 0; i < 16; i++)
            M[i] = M[i] * det;
    
        return M;
    },
    transpose4 : function(A){
        let M = new Float32Array();
        for(let i = 0; i < 4; i++){
            for(let j = 0; j < 4; j++){
                M[i*4 + j] = A[j*4 + i];
            }
        }
        return M;
    },
    getRotation3 : function(vec, theta) {
        let M = this.construct(3, 3);
        let R = this.getRotation3AsFuncs(vec);
        for(let col = 0; col < 3; col++){
            for(let row = 0; row < 3; row++){
                M[row][col] = R[row][col](theta);
            }
        }
        return M;
    },
    // Taken from ../../lib/cuon-matrix.js
    getOrtho : function(left, right, bottom, top, near, far) {
        let M = new Float32Array(16);
        let rw, rh, rd;
      
        rw = 1 / (right - left);
        rh = 1 / (top - bottom);
        rd = 1 / (far - near);
      
      
        M[0]  = 2 * rw;
        M[1]  = 0;
        M[2]  = 0;
        M[3]  = 0;
      
        M[4]  = 0;
        M[5]  = 2 * rh;
        M[6]  = 0;
        M[7]  = 0;
      
        M[8]  = 0;
        M[9]  = 0;
        M[10] = -2 * rd;
        M[11] = 0;
      
        M[12] = -(right + left) * rw;
        M[13] = -(top + bottom) * rh;
        M[14] = -(far + near) * rd;
        M[15] = 1;
      
        return M;
    },
    getPerspective : function(fovy, aspect, near, far) {
        let rd, s, ct;
      
        if (near === far || aspect === 0) {
          throw 'null frustum';
        }
        if (near <= 0) {
          throw 'near <= 0';
        }
        if (far <= 0) {
          throw 'far <= 0';
        }
      
        fovy = Math.PI * fovy / 180 / 2;
        s = Math.sin(fovy);
        if (s === 0) {
          throw 'null frustum';
        }
      
        rd = 1 / (far - near);
        ct = Math.cos(fovy) / s;
      
        let M = new Float32Array(16);
        M[0]  = ct / aspect;
        M[1]  = 0;
        M[2]  = 0;
        M[3]  = 0;
      
        M[4]  = 0;
        M[5]  = ct;
        M[6]  = 0;
        M[7]  = 0;
      
        M[8]  = 0;
        M[9]  = 0;
        M[10] = -(far + near) * rd;
        M[11] = -1;
      
        M[12] = 0;
        M[13] = 0;
        M[14] = -2 * near * far * rd;
        M[15] = 0;
      
        return M;
    },
    getLookAt : function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
        let fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;
      
        fx = centerX - eyeX;
        fy = centerY - eyeY;
        fz = centerZ - eyeZ;
      
        // Normalize f.
        rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
        fx *= rlf;
        fy *= rlf;
        fz *= rlf;
      
        // Calculate cross product of f and up.
        sx = fy * upZ - fz * upY;
        sy = fz * upX - fx * upZ;
        sz = fx * upY - fy * upX;
      
        // Normalize s.
        rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
        sx *= rls;
        sy *= rls;
        sz *= rls;
      
        // Calculate cross product of s and f.
        ux = sy * fz - sz * fy;
        uy = sz * fx - sx * fz;
        uz = sx * fy - sy * fx;
      
        // Set to this.
        let M = new Float32Array(16);
        M[0] = sx;
        M[1] = ux;
        M[2] = -fx;
        M[3] = 0;
      
        M[4] = sy;
        M[5] = uy;
        M[6] = -fy;
        M[7] = 0;
      
        M[8] = sz;
        M[9] = uz;
        M[10] = -fz;
        M[11] = 0;
      
        M[12] = 0;
        M[13] = 0;
        M[14] = 0;
        M[15] = 1;
      
        // Translate.
        return translated(M, -eyeX, -eyeY, -eyeZ);

        function translated(M, x, y, z){
            M[12] += M[0] * x + M[4] * y + M[8]  * z;
            M[13] += M[1] * x + M[5] * y + M[9]  * z;
            M[14] += M[2] * x + M[6] * y + M[10] * z;
            M[15] += M[3] * x + M[7] * y + M[11] * z;
            return M;
        }
    },
    getRotated : function(rotation) {
        let a= 
        this.multiply(
            this.multiply( 
                this.rotateX4(rotation[0]), 
                this.rotateY4(rotation[1]) 
            ),
            this.rotateZ4(rotation[2])
        );
        return a;
    },
    getScaled : function(scale) {
        let M = new Float32Array(16);
        M[0] = scale[0];
        M[5] = scale[1];
        M[10] = scale[2];
        M[15] = 1;
        return M;
    },
    getTranslated : function(position) {
        let M = Matrix.getIdentity(4);
        M[12] += position[0];
        M[13] += position[1];
        M[14] += position[2];
        return M;
    },
    multiply : function(A, B) {
        let M = new Float32Array(16);
        for(let i = 0; i < 16; i++){
            let startJ = Math.floor(i/4)*4;
            let startK = i%4;
            for(let j = startJ, k = startK; j < startJ + 4; j++, k+=4){
                M[i] += A[j]*B[k];
            }
        }
        return M;
    },

      
    print : function(M, m, n) {
        for(let j = 0; j < m; j++){
            let str = "";
            for(let i = 0; i < n; i++){
                str += "\t" + M[i][j];
            }
            console.log(str);
        }
    }
};

const Vector = {
    construct : function(){
        return new Float32Array(3);
    },
    // Ax = b transformation
    transform : function(A, x){
        let b = new Float32Array(3);
        for(let col = 0; col < 3; col++){
            for(let row = 0; row < 3; row++){
                b[col] += A[row][col] * x[row];
            }
        }
        return b;
    },
    transform4 : function(A, x){
        let b = new Float32Array(4);
        for(let col = 0; col < 4; col++){
            for(let row = 0; row < 4; row++){
                b[col] += A[row + col*4] * x[row];
            }
        }
        return b;
    },
    rotate : function(vector, radians, axis, offset=[0,0,0]){
        // let newVector = vector;
        // let A = Matrix.getRotation3(axis, radians);
        // newVector = this.transform(A, newVector);
        // newVector = offset ? this.add(newVector, offset) : newVector;
        // return newVector;
        return this.add(this.transform(Matrix.getRotation3(axis, radians), vector), offset);
    },
    normalize : function(vec) {
        let d = this.magnitude(vec);
        //
        return d != 0 ? this.scale(vec, 1/d) : vec;
    },
    reflection : function(vec, normal){
        return Vector.subtract(Vector.scale(normal, 2*Vector.dot(normal, vec)), vec);
    },
    magnitude : function(vec) {
        return Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2]);
    },
    scale : function(vector, scale) {
        return new Float32Array([scale*vector[0], scale*vector[1], scale*vector[2]]);
    },
    subtract : function(v, w) {
        return new Float32Array([v[0]-w[0], v[1]-w[1], v[2]-w[2]]);        
    },
    add : function(v, w){        
        return new Float32Array([v[0]+w[0], v[1]+w[1], v[2]+w[2]]);
    },
    getPerpindicularTo : function(v, a = 1, b = 1) {
        let v1 = [v[1], -v[0]];
        let v2 = [-v[2], v[0]];
        return new Float32Array([v1[0]*a + v2[0]*b, v1[1]*a, v2[1]*b]);
    },
    distance : function(v, w){
        return this.magnitude(this.subtract(w,v));
    },
    equal : function(v, w){
        return v[0] === w[0] && v[1] === w[1] && v[2] === w[2];
    },
    cross : function(v, w){
        return new Float32Array([v[1]*w[2]-v[2]*w[1], v[2]*w[0]-v[0]*w[2], v[0]*w[1]-v[1]*w[0]]);
    },
    dot : function(v, w){
        return v[0]*w[0]+v[1]*w[1]+v[2]*w[2];
    },
    multiply : function(v, w){
        return new Float32Array([v[0]*w[0], v[1]*w[1], v[2]*w[2]]);
        
    },
    clamp : function(vec, min, max){
        let a = vec[0] < min ? min : (vec[0] > max ? max : vec[0]);
        let b = vec[1] < min ? min : (vec[1] > max ? max : vec[1]);
        let c = vec[2] < min ? min : (vec[2] > max ? max : vec[2]);
        return new Float32Array([a, b, c]);
    },

    // Returns the intersecting point between two 2d vectors.
    // I derived this on paper
    getIntersection_R2 : function(v0, v1, w0, w1, toR3=false){
        let denomV = (v1[0]-v0[0]);
        let denomW = (w1[0]-w0[0]);
        denomV = denomV === 0 ? Number.EPSILON : denomV;
        denomW = denomW === 0 ? Number.EPSILON : denomW;
        let mV = (v1[1]-v0[1])/denomV;
        let mW = (w1[1]-w0[1])/denomW;
        let div = 1/(mV === mW ? Number.EPSILON : mV-mW);
        let x = div*(w0[1]-v0[1]+v0[0]*mV-w0[0]*mW);
        let y = mV*(x - v0[0]) + v0[1];
        return toR3 ? [x,y,v0[2]] : [x,y];

    }
}

const Shape = {
    getCircle : function (radius, res, axis, offset=[0,0,0]){
        let radians = 2 * Math.PI / res;
        //let vector = Vector.getPerpindicularTo(axis, radius, -radius);
        let vector = [0,0, radius];
        axis = Vector.normalize(axis);
        
        let points = [];
        for(let i = 0; i < res; i++){
            vector = Vector.rotate(vector, radians, axis, offset);
            points.push(...vector);
            vector = Vector.subtract(vector, offset);
        }
        return points;
    },
    getCylinder : function(radius, res, point1, point2){
        axis = Vector.normalize(Vector.subtract(point2, point1));
        let length = Vector.magnitude(Vector.subtract(point2, point1));
        let radians = 2 * Math.PI / res;
        let to = Vector.scale(axis, length);
        let vector = [0, 0, radius];
        let wector = [0, 0, radius];
        let points = [];
        let indicees = [];
        let uvs = [];

        //0. initialize: offset
        //loop:
        //1. push points
        //2. unoffset
        //3. rotate and offset
        //4. push points

        // initialize
        vector = Vector.add(vector, point1);
        wector = Vector.add(wector, point2);
        // generate a quad res times
        for(let i = 0; i < res; i++){
            // push points
            points.push(...vector, ...wector);
            uvs.push(i/res,0,i/res,1);
            // unoffset
            vector = Vector.subtract(vector, point1);
            // rotate and offset
            vector = Vector.rotate(vector, radians, axis, point1);
            wector = Vector.add(vector, Vector.scale(axis, length));
            // push points
            points.push(...vector, ...wector);
            uvs.push((i+1)/res,0,(i+1)/res,1);
        }
        let limit = points.length/3;
        for(let i = 0; i < limit; i+=4){
            indicees.push(i, i + 2, i + 1);
            indicees.push(i + 1, i + 2, i + 3);
        }
        return {
            vertices : points,
            indicees : indicees,
            uvs: uvs
        };
        
    },
    getConnectedCylinders : function(radius, res, props1, props2){
        props1.offset = props1.offset || [0,0,0];
        props2.offset = props2.offset || [0,0,0];
        props1.axis = Vector.normalize(props1.axis);
        props2.axis = Vector.normalize(props2.axis);

        let points1 = [], indicees1 = [];
        let points2 = [], indicees2 = [];
        let uvs1 = [], uvs2 = [];

        let radians = 2 * Math.PI / res;
        let perp = [0,0,radius];


        //0: initialize: offset, and get intersection
        //loop:
        //1. push points
        //2. unoffset
        //3. rotate and offset
        //4. get intersection
        //5. push points

        // initialize
        let start1 = Vector.add(perp, props1.offset);
        let start2 = Vector.add(perp, props2.offset);
        let end2 = Vector.add(start2, Vector.scale(props2.axis, props2.length));        
        let dir1 = Vector.add(start1, props1.axis);
        let dir2 = Vector.add(start2, props2.axis);
        let intersection = Vector.getIntersection_R2(start1, dir1, start2, dir2, true);
        
        // Generate a Quad res times
        for(let i = 0; i < res; i++){
            // 1. push points
            points1.push(...start1, ...intersection); 
            points2.push(...intersection, ...end2);
            uvs1.push(i/res,0,i/res,1);
            uvs2.push(i/res,0,i/res,1);
            // 2. unoffset
            start1 = Vector.subtract(start1, props1.offset);
            start2 = Vector.subtract(start2, props2.offset); 
            // 3. rotate and offset
            start1 = Vector.rotate(start1, radians, props1.axis, props1.offset);
            start2 = Vector.rotate(start2, radians, props2.axis, props2.offset);
            // 4. get intersection
            dir1 = Vector.add(start1, props1.axis);
            dir2 = Vector.add(start2, props2.axis);
            intersection = Vector.getIntersection_R2(start1, dir1, start2, dir2, true);
            // 5. push points
            points1.push(...start1, ...intersection);
            end2 = Vector.add(start2, Vector.scale(props2.axis, props2.length));            
            points2.push(...intersection, ...end2);
            uvs1.push((i+1)/res,0,(i+1)/res,1);
            uvs2.push((i+1)/res,0,(i+1)/res,1);
 
        }

        // Add indicees to cylinder 0
        let limit = points1.length/3 + props1.indexOffset;
        for(let i = props1.indexOffset; i < limit; i+=4){
            indicees1.push(i, i + 2, i + 1);
            indicees1.push(i + 1, i + 2, i + 3);
        }
        // Add indicees to cylinder 1
        limit = points1.length/3 + props2.indexOffset;
        for(let i = props2.indexOffset; i < limit; i+=4){
            indicees2.push(i, i + 2, i + 1);
            indicees2.push(i + 1, i + 2, i + 3);
        }

        // Return mesh for both cylinders
        return {
            cyl0 : {
                vertices : points1,
                indicees : indicees1,
                uvs : uvs1
            },
            cyl1 : {
                vertices : points2,
                indicees : indicees2,
                uvs : uvs2
            }
            
        };

    }
}

function toPrecision(num, decimalPlaces) {
    let off = Math.pow(10, decimalPlaces);
    return (Math.floor(num * off) / off);
}