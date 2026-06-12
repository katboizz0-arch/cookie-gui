import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import CustomAccentModalComponent from '../components/tw-custom-accent-modal/custom-accent-modal.jsx';
import {closeCustomAccentModal} from '../reducers/modals';
import {setTheme} from '../reducers/theme';
import {persistTheme} from '../lib/themes/themePersistance';
import {ACCENT_CUSTOM, Theme} from '../lib/themes';

class CustomAccentModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleChangeColor',
            'handleSave',
            'handleClose'
        ]);
        const initial = (() => {
            try { return localStorage.getItem('tw:customAccent') || '#00cc99'; } catch (e) { return '#00cc99'; }
        })();
        this.state = {
            color: initial
        };
    }

    handleChangeColor (e) {
        const value = e.target.value;
        this.setState({color: value});
    }

    handleSave () {
        try { localStorage.setItem('tw:customAccent', this.state.color); } catch (e) {}
        // apply immediately
        document.documentElement.style.setProperty('--tw-custom-accent', this.state.color);
        // set theme to custom
        this.props.onApplyCustomAccent();
        this.props.onClose();
    }

    handleClose () {
        this.props.onClose();
    }

    render () {
        return (
            <CustomAccentModalComponent
                color={this.state.color}
                onChangeColor={this.handleChangeColor}
                onSave={this.handleSave}
                onClose={this.handleClose}
            />
        );
    }
}

CustomAccentModal.propTypes = {
    onClose: PropTypes.func,
    onApplyCustomAccent: PropTypes.func
};

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeCustomAccentModal()),
    onApplyCustomAccent: () => {
        dispatch(setTheme(new Theme('custom', undefined, undefined)));
        persistTheme(new Theme('custom', undefined, undefined));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomAccentModal);
