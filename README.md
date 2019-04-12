# Touch Screen Event
<strong>ts-event.js</strong> is a simple script that allows you to manage touch gestures.

-----

# *Object* TSEvent
Script build object named __TSEvent__ on window.

## *Boolean* TSEvent.can
A *Boolean* for know if screen is touch.

## *TSManager* TSEvent.addListener(*HTMLElement* target, *String* events, *Function* callback)
## *TSManager* TSEvent.addListener(*HTMLElement* target, *Object* callbacks)
Add listener for target.

Possible events :
* start
* move
* end
* press
* hold
* tap
* doubleTap
* swipeTop
* swipeBottom
* swipeLeft
* swipeRight
* pinch
* spread
* rotate

You can add multiple events on target.
In *String* with space separator for common callback or in *Object* with event in key and callback in value.

Callback has like context the target and received a *Object* custom event like single argument.

Return __TSManager__ instance of target.

## *TSManager* TSEvent.removeListener(*HTMLElement* target, *String* events, *Function* callback)
## *TSManager* TSEvent.removeListener(*HTMLElement* target, *Object* callbacks)
Remove listener for target.

Same logic as addListener for remove multiple events.

Return __TSManager__ instance of target.

------

# *Object* custom_event
Generate for callback. Same *Object* for all listener of one event !

## *String* custom_event.type
Type of event.

## *Object* custom_event.srcEvent
*TouchEvent* who generate the event.

## *Object* custom_event.manager
__TSManager__ who trigger the event.

## *Object* custom_event.fingers
__TSFinger__ who trigger the event.

------

# *Object* TSManager
Single instance create for a target at first *addListener* call.

## *HTMLElement* TSManager.element
__TSManager__ target.

## *Object* TSManager.fingers
List of __TSFinger__ who touch target.

## *Array* TSManager.circles
List of all __TSCircle__ create by multiple touch at same time on target.
Last __TSCircle__ is the current.

------

# *Object* TSFinger
Instance create every time finger touch a target.

## *Number* TSFinger.id
*Touch* original identifier for this finger.

## *Number* TSFinger.timeStamp
Timestamp of start of touch by this finger on a target.

## *Array* TSFinger.touches
List of all *Touch* instance create between start and end of touch by this finger on a target.

## *Null || Array* TSFinger.lastTouches
List of all *Touch* instance create between start and end of previous touch by this finger on a target.

------

# *Object* TSCircle
Instance create every time multiple finger touch a target at same time.

## *Number* TSCircle.timeStamp
Timestamp of instance has create.

## *Array* TSCircle.touches
List of the two most distant *Touch* instance who create circle.

## *Number* TSCircle.clientX
## *Number* TSCircle.clientY
## *Number* TSCircle.clientRay
Center coordinates and radius of circle relative to the viewport, not including any scroll offset.

## *Number* TSCircle.pageX
## *Number* TSCircle.pageY
## *Number* TSCircle.pageRay
Center coordinates and radius of circle relative to the viewport, including any scroll offset.

## *Number* TSCircle.screenX
## *Number* TSCircle.screenY
## *Number* TSCircle.screenRay
Center coordinates and radius of circle relative to the screen, not including any scroll offset.

## *Number* TSCircle.rotationAngle
The radian angle of the line passing through both *Touch* instance who create circle.