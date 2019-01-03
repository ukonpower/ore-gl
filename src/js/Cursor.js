export default class Cursor {
    constructor() {
        this._x = -1;
        this._y = -1;
        this._deltaY = 0;
        this._deltaX = 0;
        this._touchDown = false;
        this.touchStartTime = 0;
        this.touchDeltaTime = 0;
        this.beginTouchX;
        this.beginTouchY;
        this.endTouchX;
        this.endTouchY;
        this.tapEvent = null;
        this.Update();
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

    CursorDown(cursor) {
        this._touchDown = true;

        this.GetMoucePos(cursor);

        this.beginTouchX = this.x;
        this.beginTouchY = this.y;

        this.touchStartTime = Date.now();

    }

    CursorMove(cursor) {
        if (this._touchDown == true) {
            this.GetMoucePos(cursor);
        }
    }

    CursorUp(cursor) {
        this._touchDown = false;
        this.touchDeltaTime = Date.now() - this.touchStartTime;
        this.endTouchX = this.x;
        this.endTouchY = this.y;
        if(this.touchDeltaTime < 400 && Math.abs(this.beginTouchX - this.endTouchX) + Math.abs(this.beginTouchY - this.endTouchY) < 30){
            if(this.tapEvent != null)
                this.tapEvent({x:this.x,y:this.y});  
        }
        this._x = -1;
        this._y = -1;
    }

    GetMoucePos(cursor){
        if (cursor.pageX) {
            this.x = cursor.pageX;
            this.y = cursor.pageY;
        } else {
            this.x = cursor.touches[0].clientX;
            this.y = cursor.touches[0].clientY;
        }
    }

    Update(){
        this._deltaX *= 0.97;
        this._deltaY *= 0.97;
        requestAnimationFrame(this.Update.bind(this));
    }
    
}