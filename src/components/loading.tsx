import styles from './loading.module.css';

export const LoadingSpinner = (props: {scale?: string}) => {
    // add a dynamic scale value to the div
    return <div className={styles.customLoader} style={{scale: props.scale ?? '1'}} ></div>
}

export const LoadingPage = () => {
    return <div className="absolute top-0 right-0 w-screen h-screen flex justify-center items-center"><LoadingSpinner scale={'2'}/></div>
}