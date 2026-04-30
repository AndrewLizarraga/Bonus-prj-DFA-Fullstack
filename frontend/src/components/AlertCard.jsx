function AlertCard({ title, description, type = 'api-response', useAlert = false }) {
    return(
        <div className={`alert-card alert-${type}`}>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

export default AlertCard;