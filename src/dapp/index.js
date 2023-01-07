import DOM from "./dom";
import Contract from "./contract";
import "./flightsurety.css";

(async () => {
    let contract = new Contract("localhost", () => {
        contract.isOperational((error, result) => {
            console.log(error, result);
            display("Operational Status", "Check if contract is operational", [
                { label: "Operational Status", error: error, value: result },
            ]);
        });

        DOM.elid("submit-oracle").addEventListener("click", () => {
            let flight = DOM.elid("flight-number").value;

            contract.fetchFlightStatus(flight, (error, result) => {
                display("Oracles", "Trigger oracles", [
                    {
                        label: "Set Flight Status",
                        error: error,
                        value: result.flight + " " + result.timestamp,
                    },
                ]);
            });
        });

        DOM.elid("withdraw-credits").addEventListener("click", () => {
            contract.withdraw((error, result) => {
                console.log(error, result);
            });
        });

        const display = (title, description, results) => {
            let displayDiv = DOM.elid("display-wrapper");
            let section = DOM.section();
            section.appendChild(DOM.h4(title));
            section.appendChild(DOM.h5(description));
            results.map((result) => {
                let row = section.appendChild(DOM.div({ className: "row" }));
                row.appendChild(DOM.div({ className: "col-sm-4 field" }, result.label));
                row.appendChild(
                    DOM.div(
                        { className: "col-sm-8 field-value" },
                        result.error ? String(result.error) : String(result.value)
                    )
                );
                section.appendChild(row);
            });
            displayDiv.append(section);
        };

        const buyInsurance = () => {
            const flight = DOM.elid("flight-number").value;
            const amount = DOM.elid("insurance-amount").value;
            console.log(flight, amount);

            try {
                contract.buyInsurance(amount, flight, (error, result) => {
                    console.log("Insurance purchased with", amount);
                    display(
                        "Oracles",
                        "Trigger oracles",
                        [
                            {
                                label: "Assurance Detail",
                                error: error,
                                value:
                                    "Flight Name: " +
                                    flight +
                                    " | Assurance Paid: " +
                                    amount +
                                    " ether" +
                                    " | Paid on Delay: " +
                                    amount * 1.5 +
                                    " ETH",
                            },
                        ],
                        "display-flight",
                        "display-detail"
                    );
                });
            } catch (error) {
                console.log(error);
            }
        };

        const selectFlight = (event) => {
            DOM.elid("dropdownMenuLink").textContent = event.target.text;
            DOM.elid("flight-number").value = event.target.text;
        };

        const renderFlights = async () => {
            try {
                const flights = [
                    { id: 1, name: "LAH3912" },
                    { id: 2, name: "RYA2141" },
                    { id: 3, name: "KLM1231" }
                ];

                flights.forEach((f) => {
                    const option = DOM.a(
                        {
                            className: `dropdown-item`
                        },
                        f.name
                    );

                    option.addEventListener("click", selectFlight);

                    DOM.elid("flights").appendChild(option);
                });

                DOM.elid("buy-flight-insurance").addEventListener(
                    "click",
                    buyInsurance
                );
            } catch (error) {
                console.log(error);
            }
        };

        DOM.elid("connected-address").textContent = contract.passengers[3];

        renderFlights();
    });
})();