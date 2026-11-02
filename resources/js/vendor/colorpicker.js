import { h } from 'vue';
import { Sketch } from '@ckpack/vue-color';

export default {
    install(app) {
        app.component('colorpicker', {
            components: {
                'sketch-picker': Sketch,
            },
            props: ['color', 'modelValue'],
            data() {
                return {
                    colors: {
                        hex: '#000000',
                        a: 1,
                    },
                    colorValue: '',
                    displayPicker: false,
                }
            },
            render() {
                return h('div', { ref: 'colorpicker' }, [
                    h('div', { class: 'flex w-full' }, [
                        h('span', {
                            class: 'inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm cursor-pointer',
                            onClick: () => this.togglePicker(),
                        }, [h('i', { class: 'fa fa-tint' })]),
                        h('input', {
                            type: 'text',
                            class: 'w-auto border-gray-300 text-sm',
                            style: { height: '42px' },
                            value: this.colorValue,
                            readonly: true,
                            onFocus: () => this.showPicker(),
                            onInput: this.updateFromInput,
                        }),
                        h('span', {
                            class: 'inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm cursor-pointer w-12',
                            onClick: () => this.togglePicker(),
                            style: { backgroundColor: this.colorValue },
                        }),
                    ]),
                    h('div', { class: 'absolute z-50' }, [
                        this.displayPicker
                            ? h(Sketch, { modelValue: this.colors, 'onUpdate:modelValue': (color) => this.updateFromPicker(color) })
                            : null,
                    ]),
                ]);
            },
            mounted() {
                const initialColor = this.modelValue || this.color;
                if(initialColor !== undefined && initialColor !== null && initialColor !== '') this.setColor(initialColor);
            },
            methods: {
                setColor(color) {
                    this.updateColors(color);
                    this.colorValue = color;
                },
                updateColors(color) {
                    if(color && color.slice(0, 1) == '#') {
                        this.colors = {
                            hex: color,
                            a: 1,
                        };
                    }
                    else if(color && color.slice(0, 4) == 'rgba') {
                        var rgba = color.replace(/^rgba?\(|\s+|\)$/g,'').split(','),
                            hex = '#' + ((1 << 24) + (parseInt(rgba[0]) << 16) + (parseInt(rgba[1]) << 8) + parseInt(rgba[2])).toString(16).slice(1);
                        this.colors = {
                            hex: hex,
                            a: rgba[3],
                        }
                    } else {
                        this.color = color;
                    }
                },
                showPicker() {
                    document.addEventListener('click', this.documentClick);
                    this.displayPicker = true;
                },
                hidePicker() {
                    document.removeEventListener('click', this.documentClick);
                    this.displayPicker = false;
                },
                togglePicker() {
                    this.displayPicker ? this.hidePicker() : this.showPicker();
                },
                updateFromInput() {
                    this.updateColors(this.colorValue);
                },
                updateFromPicker(color) {
                    this.colors = color;
                    const alpha = (color.rgba && color.rgba.a !== undefined) ? color.rgba.a : 1;
                    if(alpha == 1) {
                        this.colorValue = color.hex;
                    }
                    else {
                        this.colorValue = 'rgba(' + color.rgba.r + ', ' + color.rgba.g + ', ' + color.rgba.b + ', ' + alpha + ')';
                    }
                },
                documentClick(e) {
                    var el = this.$refs.colorpicker,
                        target = e.target;
                    if(el !== target && !el.contains(target)) {
                        this.hidePicker()
                        this.$emit('change');
                    }
                }
            },
            watch: {
                colorValue(val) {
                    if(val) {
                        this.updateColors(val);
                        this.$emit('update:modelValue', val);
                    }
                },
                'modelValue': function(val) {
                    this.colorValue = val;
                },
                'color': function(val) {
                    this.colorValue = val;
                }
            },
        });
    }
}
