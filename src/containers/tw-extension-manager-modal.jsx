import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import log from '../lib/log';
import ExtensionManagerModalComponent from '../components/tw-extension-manager-modal/extension-manager-modal.jsx';
import {closeExtensionManagerModal} from '../reducers/modals';

class ExtensionManagerModal extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            updateCount: 0
        };
        bindAll(this, [
            'handleClose',
            'handleRefreshExtension',
            'handleRefreshAll',
            'handleDeleteExtension'
        ]);
    }

    getExtensions () {
        if (!this.props.vm || !this.props.vm.extensionManager) {
            return [];
        }
        const loaded = this.props.vm.extensionManager.getExtensionURLs ? this.props.vm.extensionManager.getExtensionURLs() : {};
        if (Array.isArray(loaded)) {
            return loaded.map(item => ({
                ...item,
                displayName: item.extensionId || item.extensionURL || 'Unknown extension'
            }));
        }
        return Object.entries(loaded).map(([extensionId, extensionURL]) => ({
            extensionId,
            extensionURL,
            displayName: extensionId || extensionURL || 'Unknown extension'
        }));
    }

    handleRefreshExtension (extension) {
        if (!extension || !extension.extensionId) {
            return;
        }
        this.props.vm.extensionManager.refreshBlocks(extension.extensionId)
            .catch(err => {
                log.error(err);
                alert(err);
            });
    }

    handleRefreshAll () {
        if (!this.props.vm || !this.props.vm.extensionManager) {
            return;
        }
        this.props.vm.extensionManager.refreshBlocks()
            .catch(err => {
                log.error(err);
                alert(err);
            });
    }

    handleDeleteExtension (extension) {
        if (!extension || !extension.extensionId) {
            return;
        }
        this.props.vm.extensionManager.unloadExtension(extension.extensionId)
            .then(() => {
                this.setState(({updateCount}) => ({updateCount: updateCount + 1}));
            })
            .catch(err => {
                log.error(err);
                alert(err);
            });
    }

    handleClose () {
        this.props.onClose();
    }

    render () {
        return (
            <ExtensionManagerModalComponent
                extensions={this.getExtensions()}
                onRefreshExtension={this.handleRefreshExtension}
                onRefreshAll={this.handleRefreshAll}
                onDeleteExtension={this.handleDeleteExtension}
                onClose={this.handleClose}
            />
        );
    }
}

ExtensionManagerModal.propTypes = {
    onClose: PropTypes.func,
    vm: PropTypes.shape({
        extensionManager: PropTypes.shape({
            getExtensionURLs: PropTypes.func,
            refreshBlocks: PropTypes.func
        })
    })
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeExtensionManagerModal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExtensionManagerModal);
