/**
 * Created by Denis on 29.09.2017.
 */
import React from 'react';
import {
    Checkbox,
    Avatar
} from 'material-ui';// eslint-disable-line

const style = {
    display: 'block',
    width: 76,
    position: 'absolute',
    top: 0,
    marginTop: 4,
    left: 16,
    height: 40,
    paddingLeft: 36
};

export default function AvatarWithCheckbox(props) { // eslint-disable-line
    return <div style={props.style ? {...props.style, ...style} : style}>
        <Checkbox style={{display: 'block', width: 24, position: 'absolute', left: 0, top: 8}} checked={props.checked} onClick={e => {
            e.stopPropagation();
        }} onCheck={(event, isInputChecked) => {props.onCheck && props.onCheck(event, isInputChecked)}} />
        {props.avatar}
    </div>;
};