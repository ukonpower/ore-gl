export default class Cursor {
    constructor() {
        this._x = -1;
        this._y = -1;
        this._deltaY;
        this._deltaX
        this._touchDown = false;
    }

    set x(x) {
        if (this._x == -1) this._deltaX = 0;
        else this._deltaX = x - this._x
        this._x = x;
    }
    get x() {
        return this._x;
    }

    set y(y) {
        if (this._y == -1) this._deltaY = 0;
        else this._deltaY = y - this._y
        this._y = y;
    }

    get y() {
        return this._y;
    }

    get deltaX() {
        if (this._deltaX != null) return this._deltaX;
        else return 0;
    }

    get deltaY() {
        if (this._deltaY != null) return this._deltaY;
        else return 0;
    }

    TouchStart(cursor) {
        this._touchDown = true;
        if (cursor.pageX) {
            this.x = cursor.pageX;
            this.y = cursor.pageY;
        } else {
            this.x = cursor.touches[0].clientX;
            this.y = cursor.touches[0].clientY;
        }
    }

    TouchMove(cursor) {
        if (this._touchDown == true) {
            if (cursor.pageX) {
                this.x = cursor.pageX;
                this.y = cursor.pageY;
            } else {
                this.x = cursor.touches[0].clientX;
                this.y = cursor.touches[0].clientY;
            }
        }
    }

    TouchEnd() {
        this._touchDown = false;
        this._x = -1;
        this._y = -1;
    }
}