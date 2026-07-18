// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RitualBio
 * @notice On-chain profile / Linktree for Ritual Chain
 * @dev Simple mapping: address => Profile
 */
contract RitualBio {
    struct Profile {
        string name;
        string bio;
        string[] links;
        uint256 updatedAt;
    }

    mapping(address => Profile) private _profiles;

    event ProfileUpdated(address indexed user, string name, uint256 linkCount);

    /**
     * @notice Set or update your profile
     * @param name Display name
     * @param bio Short bio
     * @param links Array of URLs
     */
    function setProfile(
        string calldata name,
        string calldata bio,
        string[] calldata links
    ) external {
        require(bytes(name).length > 0, "Name required");
        require(bytes(name).length <= 64, "Name too long");
        require(bytes(bio).length <= 500, "Bio too long");
        require(links.length <= 20, "Max 20 links");

        // Validate link lengths
        for (uint256 i = 0; i < links.length; i++) {
            require(bytes(links[i]).length <= 500, "Link too long");
        }

        _profiles[msg.sender] = Profile({
            name: name,
            bio: bio,
            links: links,
            updatedAt: block.timestamp
        });

        emit ProfileUpdated(msg.sender, name, links.length);
    }

    /**
     * @notice Get a profile
     * @param user Address to look up
     * @return name Display name
     * @return bio Short bio
     * @return links Array of URLs
     * @return updatedAt Last update timestamp
     */
    function getProfile(address user)
        external
        view
        returns (
            string memory name,
            string memory bio,
            string[] memory links,
            uint256 updatedAt
        )
    {
        Profile storage p = _profiles[user];
        return (p.name, p.bio, p.links, p.updatedAt);
    }

    /**
     * @notice Check if address has a profile
     */
    function hasProfile(address user) external view returns (bool) {
        return bytes(_profiles[user].name).length > 0;
    }

    /**
     * @notice Delete your profile
     */
    function deleteProfile() external {
        delete _profiles[msg.sender];
    }
}
