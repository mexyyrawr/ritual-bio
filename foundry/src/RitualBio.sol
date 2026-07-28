// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RitualBio v4
 * @notice On-chain profile / Linktree for Ritual Chain
 * @dev Simple mapping: address => Profile, with optional username for vanity URLs
 */
contract RitualBio {
    struct Profile {
        string username;    // vanity username, e.g. "tuan"
        string name;
        string bio;
        string avatarUrl;
        string[] links;
        uint256 updatedAt;
    }

    mapping(address => Profile) private _profiles;
    mapping(string => address) private _usernameToAddress;

    event ProfileUpdated(address indexed user, string username, string name, uint256 linkCount);
    event UsernameChanged(address indexed user, string oldUsername, string newUsername);

    /**
     * @notice Set or update your profile
     * @param username Vanity username (lowercase, a-z0-9_, 3-20 chars). Can be empty to skip.
     * @param name Display name
     * @param bio Short bio
     * @param avatarUrl Avatar image URL
     * @param links Array of URLs
     */
    function setProfile(
        string calldata username,
        string calldata name,
        string calldata bio,
        string calldata avatarUrl,
        string[] calldata links
    ) external {
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= 64, "Name too long");
        require(bytes(bio).length <= 500, "Bio too long");
        require(bytes(avatarUrl).length <= 500, "Avatar URL too long");
        require(links.length <= 20, "Max 20 links");

        // Validate link lengths
        for (uint256 i = 0; i < links.length; i++) {
            require(bytes(links[i]).length <= 500, "Link too long");
        }

        // Handle username
        bytes32 usernameKey = keccak256(bytes(username));
        bytes32 emptyKey = keccak256(bytes(""));

        if (usernameKey != emptyKey) {
            // Username provided — validate format
            require(bytes(username).length >= 3, "Username too short");
            require(bytes(username).length <= 20, "Username too long");
            require(_isValidUsername(username), "Invalid username format");

            // Check if username is taken by someone else
            address owner = _usernameToAddress[username];
            if (owner != address(0) && owner != msg.sender) {
                revert("Username already taken");
            }

            // Release old username if changing
            string storage oldUsername = _profiles[msg.sender].username;
            if (bytes(oldUsername).length > 0) {
                delete _usernameToAddress[oldUsername];
            }

            _usernameToAddress[username] = msg.sender;
            emit UsernameChanged(msg.sender, oldUsername, username);
        }

        _profiles[msg.sender] = Profile({
            username: username,
            name: name,
            bio: bio,
            avatarUrl: avatarUrl,
            links: links,
            updatedAt: block.timestamp
        });

        emit ProfileUpdated(msg.sender, username, name, links.length);
    }

    /**
     * @notice Get a profile by address
     */
    function getProfile(address user)
        external
        view
        returns (
            string memory username,
            string memory name,
            string memory bio,
            string memory avatarUrl,
            string[] memory links,
            uint256 updatedAt
        )
    {
        Profile storage p = _profiles[user];
        return (p.username, p.name, p.bio, p.avatarUrl, p.links, p.updatedAt);
    }

    /**
     * @notice Get a profile by username
     */
    function getProfileByUsername(string calldata username)
        external
        view
        returns (
            string memory name,
            string memory bio,
            string memory avatarUrl,
            string[] memory links,
            uint256 updatedAt
        )
    {
        address user = _usernameToAddress[username];
        require(user != address(0), "Username not found");
        Profile storage p = _profiles[user];
        return (p.name, p.bio, p.avatarUrl, p.links, p.updatedAt);
    }

    /**
     * @notice Resolve username to address
     */
    function resolveUsername(string calldata username) external view returns (address) {
        return _usernameToAddress[username];
    }

    /**
     * @notice Check if address has a profile
     */
    function hasProfile(address user) external view returns (bool) {
        return bytes(_profiles[user].name).length > 0;
    }

    /**
     * @notice Check if username is available
     */
    function isUsernameAvailable(string calldata username) external view returns (bool) {
        return _usernameToAddress[username] == address(0);
    }

    /**
     * @notice Delete your profile
     */
    function deleteProfile() external {
        string storage username = _profiles[msg.sender].username;
        if (bytes(username).length > 0) {
            delete _usernameToAddress[username];
        }
        delete _profiles[msg.sender];
    }

    /**
     * @dev Validate username: lowercase letters, numbers, underscore only
     */
    function _isValidUsername(string memory username) internal pure returns (bool) {
        bytes memory b = bytes(username);
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            bool valid = (c >= 0x61 && c <= 0x7A) || // a-z
                         (c >= 0x30 && c <= 0x39) || // 0-9
                         (c == 0x5F);                 // _
            if (!valid) return false;
        }
        return true;
    }
}
