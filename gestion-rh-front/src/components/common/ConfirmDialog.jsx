import Button from "./Button";

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal">
      <p>{message}</p>

      <Button onClick={onConfirm}>Oui</Button>
      <Button onClick={onCancel} variant="danger">
        Annuler
      </Button>
    </div>
  );
};

export default ConfirmDialog;