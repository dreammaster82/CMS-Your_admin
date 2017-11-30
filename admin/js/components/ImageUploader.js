/**
 * Created by Denis on 03.03.2017.
 */
import React from 'react';
import Dropzone from 'react-dropzone';
import {Modal} from 'react-bootstrap';
import translate from '../translate/index.js';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import IconButton from 'material-ui/IconButton';
import RotateLeft from 'material-ui/svg-icons/image/rotate-left';
import RotateRight from 'material-ui/svg-icons/image/rotate-right';
import SwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import SwapVert from 'material-ui/svg-icons/action/swap-vert';

class ImageUploader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            url: this.props.url || null,
            type: null,
            name: this.props.url || null,
            showLoader: false,
            showModal: false
        };

        this.onDrop = (this.onDrop).bind(this);
        this.maxSize = this.props.maxSize || 2000;

        this.cropper = null;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.maxWidth) this.maxSize = nextProps.maxSize;
    }

    onDrop(acceptedFiles, rejectedFiles) {
        if (acceptedFiles.length) this.updateImage(acceptedFiles[0]);
    }

    saveEditedImage() {
        if (this.cropper) {
            let url = this.cropper.getCroppedCanvas().toDataURL(this.state.imageType);
            typeof this.props.updateImage == 'function' && this.props.updateImage({url, name: this.state.imageName});
            this.setState({url, showModal: false});
            this.cropper = null;
        }
    }

    updateImage(file) {
        this.setState({showLoader: true});
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = (event) => {
                    if (img.width <= this.maxSize && img.height <= this.maxSize) {
                        resolve(img.src);
                    } else {
                        resolve(this.resizeImage(img, this.maxSize).toDataURL(file.type));
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }).then((url) => {
            typeof this.props.updateImage == 'function' && this.props.updateImage({url, name: file.name});
            this.setState({url, showLoader: false, imageType: file.type, imageName: file.name});
        });
    }

    resizeImage(img, maxWidth, maxHeight) {
        maxHeight = maxHeight || maxWidth;
        let width = img.width, height = img.height;
        if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
        } else {
            width *= maxHeight / height;
            height = maxHeight;
        }
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        return canvas;
    }

    initCropper(el) {
        if (el) {
            this.cropper = new Cropper(el, {
                viewMode: 0,
                dragMode: 'none'
            });
        } else this.cropper = null;
    }

    editPhoto(type) {
        if (this.cropper) {
            let curData = this.cropper.getImageData();
            switch (type) {
                case 'rotateLeft':
                    this.cropper.rotate(-90);
                    break;
                case 'rotateRight':
                    this.cropper.rotate(90);
                    break;
                case 'swapHorizontal':
                    this.cropper.scale(~curData.scaleX + 1, curData.scaleY);
                    break;
                case 'swapVertical':
                    this.cropper.scale(curData.scaleX, ~curData.scaleY + 1);
                    break;
            }
        }
    }

    render() {
        return (<div className="photo-uploader">
            {this.state.url && !this.state.showLoader && <div className="edit-image m-i" onClick={() => this.setState({showModal: true})} >create</div>}
            <Dropzone onDrop={this.onDrop} className="drop-zone" accept="image/*">
                {this.state.showLoader && <div className="loader-box">
                    <div className="loader-spiner"></div>
                </div>}
                {this.state.url ? <img style={{maxWidth: '100%', maxHeight: '100%'}} src={this.state.url}/> :
                    <div className="m-i">add_a_photo</div>}
            </Dropzone>
            <Modal bsSize="large" show={this.state.url && this.state.showModal}
                   onHide={() => this.setState({showModal: false})}>
                <Modal.Body>
                    {this.state.showLoader && <div className="loader-box">
                        <div className="loader-spiner"></div>
                    </div>}
                    <div className="edit-photo-panel">
                        <IconButton onClick={() => this.editPhoto('rotateLeft')}><RotateLeft /></IconButton>
                        <IconButton onClick={() => this.editPhoto('rotateRight')}><RotateRight /></IconButton>
                        <IconButton onClick={() => this.editPhoto('swapHorizontal')}><SwapHoriz /></IconButton>
                        <IconButton onClick={() => this.editPhoto('swapVertical')}><SwapVert /></IconButton>
                    </div>
                    <div>
                        {this.state.showModal && <img src={this.state.url} ref={this.initCropper.bind(this)}
                                                      style={{maxWidth: '100%', maxHeight: '100%'}}/>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button onClick={this.saveEditedImage.bind(this)}
                            className="raise-button primary">{translate('save')}</button>
                    <button onClick={() => this.setState({showModal: false})}
                            className="raise-button secondary">{translate('cancel')}</button>
                </Modal.Footer>
            </Modal>
        </div>);
    }
}
;

export default ImageUploader;
