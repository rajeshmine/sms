import  { Component } from 'react';
import { toast } from 'react-toastify';
export default class ToastService extends Component {
    static Toast = (Message, Type) => {
       
        if (Type === 'default')
            toast(Message)
        if (Type === 'success')
            toast.success(Message)
        if (Type === 'error')
            toast.error(Message)
        if (Type === 'warn')
            toast.warn(Message)
        if (Type === 'info')
            toast.info(Message)
    }
}