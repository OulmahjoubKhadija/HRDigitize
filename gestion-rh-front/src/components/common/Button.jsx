 const Button = ({ children, onClick, variant = "primary" }) => {
   const style = {
     padding: "8px 12px",
     margin: "5px",
     cursor: "pointer",
     backgroundColor: variant === "danger" ? "#e74c3c" : "#3498db",
     color: "#fff",
     border: "none",
   };

   return (
     <button style={style} onClick={onClick}>
       {children}
    </button>
 );
};

export default Button;

// const Button = ({
//   children,
//   onClick,
//   variant = "primary",
//   type = "button",
//   ...rest
// }) => {
//   const style = {
//     padding: "8px 12px",
//     margin: "5px",
//     cursor: "pointer",
//     backgroundColor: variant === "danger" ? "#e74c3c" : "#3498db",
//     color: "#fff",
//     border: "none",
//   };

//   return (
//     <button
//       type={type}  
//       style={style}
//       onClick={onClick}
//       {...rest}
//     >
//       {children}
//     </button>
//   );
// };

// export default Button;