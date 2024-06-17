import { ReactComponent as BraavosIcon } from "../Points/braavos_icon.svg";

// due to the way this component is rendered, all styles must be inline
export const BraavosBanner = () => {
  const containerStyle = {
    width: "100%",
    height: "100%",
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          padding: "12px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <BraavosIcon style={{ width: "30px", height: "30px" }} />
        <span style={{ fontSize: "25px" }}>Braavos Boost</span>
      </div>
      <div
        style={{
          padding: "0 12px",
        }}
      >
        <p style={{ fontSize: "17px", textAlign: "left" }}>
          Get a ~1.2x boost on your Carmine points by using Braavos referral
          link.
        </p>
      </div>
      <div
        style={{
          padding: "12px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <a
          style={{
            fontSize: "14px",
            textAlign: "left",
            display: "block",
            background: "white",
            color: "#132254",
            padding: "5px",
            borderRadius: "4px",
          }}
          href="https://carmine.finance"
        >
          Don't have a link? Get one &rarr;
        </a>
      </div>
    </div>
  );
};
