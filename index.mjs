import { DateTime } from './lib/luxon.js'


const CANONICAL_TZ = 'America/New_York'
const MINUTE_TO_PIXEL_SCALING = 10

class TimeController {
    constructor() {
        this.times = [...document.querySelectorAll('[data-track]')]

        this.keep_in_sync = true

        // do something horrendous
        // 10px = 1 minute
        document.body.style.height = `${(25 * 60 * MINUTE_TO_PIXEL_SCALING)}px`

        let mins_since_midnight = this.get_mins_since_midnight()
        document.body.parentElement.scrollTop = mins_since_midnight * MINUTE_TO_PIXEL_SCALING

        console.log(`mins since midnight: ${mins_since_midnight}`)


        this.update_all_times()
        setInterval(() => this.update_all_times(), 500)

        // don't want to make a closure, likely because of perf (?)
        // idk it seems wrong
        document.addEventListener( 'scroll', this.event_scroll.bind(this) )

        // reset keys
        document.addEventListener( 'dblclick', () => this.reset_scroll())
        document.addEventListener( 'keyup', e => {
            console.log(e.code)
            if (e.code === 'Escape' || e.code === 'Enter') {
                this.reset_scroll()
            }
        } )
        document.querySelectorAll('.tz_block__real_time')
            .forEach(el => {
                el.addEventListener('click', () => this.reset_scroll())
            })

    }

    event_scroll() {
        this.keep_in_sync = false
        this.update_all_times()
    }

    reset_scroll() {
        this.keep_in_sync = true

        const correct_scroll = this.get_mins_since_midnight() * MINUTE_TO_PIXEL_SCALING
        document.body.parentElement.scrollTop = correct_scroll

        this.offset = 0

        this.update_all_times()
    }

    get_mins_since_midnight() {
        let init_time = DateTime.now().setZone(CANONICAL_TZ)
        return init_time.minute + (init_time.hour * 60)
    }

    convert_scroll_to_offset() {
        const current_scroll = document.body.parentElement.scrollTop / MINUTE_TO_PIXEL_SCALING
        return current_scroll - this.get_mins_since_midnight()
    }

    update_all_times() {
        if (this.keep_in_sync) {
            this.offset = 0
            const correct_scroll = this.get_mins_since_midnight() * MINUTE_TO_PIXEL_SCALING
            document.body.parentElement.scrollTop = correct_scroll
        }

        this.offset = this.convert_scroll_to_offset()


        for (let elem of this.times) {
            this.update_time(elem)
        }


    }

    update_time(elem) {
        let time = DateTime
            .now()
            .setZone(elem.dataset.track)

            
        elem.innerText = time.plus({ minutes: this.offset }).toFormat('HH:mm')
        elem.nextElementSibling.innerText = time.toFormat('HH:mm')

        elem.nextElementSibling.style.opacity = Math.abs( this.offset ) >= 1 ? 1 : Math.abs( this.offset )
        elem.nextElementSibling.style.pointerEvents = this.offset === 0 ? 'none' : 'initial'

    }
}

window.tc = new TimeController()
