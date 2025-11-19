import React, { useState } from "react";

export const ImageLoader = ({ src, alt = "", onError, ...props }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ position: "relative", display: "inline-block", width: "100%", height: "100%" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "20px",
            height: "20px",
            border: "2px solid #f3f3f3",
            borderTop: "2px solid rgb(190, 190, 190)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            zIndex: 1,
          }}
        />
      )}
      <img
        {...props}
        src={src}
        alt={alt||""}
        loading="lazy"
        onLoad={() => setLoading(false)}
        onError={(e) => {
          setLoading(false);
          if (onError) onError(e);
        }}
        style={{
          ...props.style,
          opacity: loading ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      />
      <style jsx>{`
        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};