pragma solidity ^0.4.25;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    address[] multiCalls = new address[](0);
    mapping(address => Airline) airlines;
    mapping(address => bool) authorizedCallers;
    mapping(address => uint256) private votes;
    mapping(address => Insurance) insurances;
    mapping(address => uint256) credits; // track credits of insuree

    /********************************************************************************************/
    /*                                       STRUCT                                             */
    /********************************************************************************************/

    struct Airline {
        bool isRegistered;
        bool isOperational;
        uint256 fund;
    }

    struct Insurance {
        address passenger;
        uint256 amount;
    }

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
    (
    )
    public
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;
        // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
    public
    view
    returns (bool)
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus
    (
        bool mode
    )
    external
    requireContractOwner
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline
    (
        address account, bool status
    )
    external
    requireIsOperational
    {
        airlines[account] = Airline(
        {
        isRegistered : true,
        isOperational : status,
        fund : 0
        }
        );

        setMultiCalls(account);
    }

    function isAirlineOperational(address account) public view returns (bool) {
        return airlines[account].isOperational;
    }

    function isAirline(address airline) external view returns (bool) {
        return airlines[airline].isRegistered;
    }

    /**
     * @dev Buy insurance for a flight
    *
    */
    function buy
    (
        address account,
        address passenger,
        uint256 amount
    )
    external
    payable
    {
        insurances[account] = Insurance({passenger : passenger, amount : amount});

        credits[passenger] = 0;

        uint256 airlineFund = airlines[account].fund;
        airlines[account].fund = airlineFund.add(amount);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
    (
        address account
    )
    external
    {
        uint256 credit = insurances[account].amount.div(2).mul(3);

        require(airlines[account].fund >= credit, "Airline dont have more money");

        uint256 airlineFund = airlines[account].fund;
        airlines[account].fund = airlineFund.sub(credit);

        insurances[account].amount = 0;

        uint256 passengerCredits = credits[insurances[account].passenger];
        credits[insurances[account].passenger] = passengerCredits.add(credit);
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                (
                    address passenger
                )
                external
                requireIsOperational
                returns (uint256)
    {
        uint256 amount = credits[passenger];
        delete credits[passenger];

        return amount;
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund
    (
        address account,
        uint256 amount
    )
    public
    payable
    {
        airlines[account].isOperational = true;
        airlines[account].fund = amount;
    }

    function getFlightKey
    (
        address airline,
        string memory flight,
        uint256 timestamp
    )
    internal
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    function authorizeCaller(address caller) external requireContractOwner {
        authorizedCallers[caller] = true;
    }

    /********************************************************************************************/
    /*                                     VOTING SYSTEM                                        */
    /********************************************************************************************/

    function getVoteCounter(
        address account
    )
    external
    view
    requireIsOperational
    returns (uint256)
    {
        return votes[account];
    }

    function incrementVoteCounter(address account) external requireIsOperational {
        uint256 vote = votes[account];
        votes[account] = vote.add(1);
    }

    function resetVoteCounter(address account)
    external requireIsOperational
    {
        delete votes[account];
    }

    function multiCallsLength()
    external
    view
    requireIsOperational
    returns (uint256)
    {
        return multiCalls.length;
    }

    function setMultiCalls(address account) private {
        multiCalls.push(account);
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
    external
    payable
    {
        fund(msg.sender, msg.value);
    }


}

