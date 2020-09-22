const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');
const { shorthand } = require('./manifest.json');
const { tooltips } = require('./tooltips.js');

const StringPart = require('./Components/StringPart');

const MessageContent = getModule(
    m => m.type && m.type.displayName == 'MessageContent',
    false
);

module.exports = class MessageTooltips extends Plugin {
    async startPlugin() {
        inject(shorthand, MessageContent, 'type', this.process.bind(this));
    }

    replace(base, item) {
        return base.map(i => {
            if (typeof i === 'string' && i.trim()) {
                const parts = i.split(item.regex);
                if (parts.length <= 1) return i;
                return React.createElement(StringPart, {
                    parts,
                    regex: item.regex,
                    name: item.name
                });
            } else if (Array.isArray(i?.props?.children))
                return {
                    ...i,
                    props: {
                        ...i.props,
                        children: this.replace(i.props.children, item)
                    }
                };
            else return i;
        });
    }

    process(_, res) {
        for (var i = 0; i < tooltips.length; i++) {
            res.props.children[1] = this.replace(
                res.props.children[1],
                tooltips[i]
            );
        }
        return res;
    }

    pluginWillUnload() {
        uninject(shorthand);
    }
};
