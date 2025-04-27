# Twin AI  
### Ownable, Personalized AI Agents on Blockchain  

[![Live Demo](https://img.shields.io/badge/Live_Demo-Active-success)](https://ai-twin-xi.vercel.app) 
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/jayasurya0007/ai-twin)  

## Key Features  

### AI Creation Engine  
- **Customizable Personalities**: Define role types (assistant, coach, etc.)  
- **Flexible Training**: Provide text samples or upload documents  
- **Privacy Controls**: Choose public or private visibility  

### Blockchain Integration  
- **Gasless NFT Minting**: Claim ownership via Base Smart Wallet  
- **On-Chain Provenance**: Immutable records on Base Sepolia  
- **Decentralized Storage**: Training data persisted on IPFS  

### High-Performance Chat  
- **Sub-100ms Responses**: Powered by Groq's LPU inference engine  
- **Role-Based Interactions**: Consistent personality maintenance  

## Technology Stack  

**Core Components**  
| Layer          | Technologies |  
|----------------|--------------|  
| **Blockchain** | Base Sepolia, Hardhat, Alchemy RPC |  
| **Web3**       | Wagmi, Privy.io (Smart Wallets) |  
| **Frontend**   | Next.js 14, Tailwind CSS |  
| **AI**         | Groq API (Llama3-70B) |  
| **Storage**    | IPFS via NFT.Storage |  

## Getting Started  

1. **Clone Repository**  
   ```bash  
   git clone https://github.com/jayasurya0007/ai-twin.git

2. **Install Dependencies**
   ```bash  
   npm install
3. **🔒 Environment Configuration**
  Create a `.env.local` file with these variables:
   ```env
    # Blockchain Configuration
    NEXT_PUBLIC_CONTRACT_ADDRESS=0x70d771BdC85CA17d1cB25BefA58ba35694DeB86B
    NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY
    PRIVATE_KEY=YOUR_DEPLOYER_PRIVATE_KEY
    
    # IPFS Storage (Pinata)
    NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
    NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
    
    # AI Configuration
    GROQ_API_KEY=your_groq_api_key
    
    # Subgraph
    NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID

4. **Run Development Server**
    ```bash
    npx next dev  
