const snarkjs = require('snarkjs');
import {expect} from 'chai';
import type {CircuitSignals, FullProof} from '../types/circuit';
import {readFileSync} from 'fs';

/** Allowed proof systems as defined in SnarkJS. */
const PROOF_SYSTEMS = ['groth16', 'plonk'] as const;

/**
 * A more extensive Circuit class, able to generate proofs & verify them.
 * Assumes that prover key and verifier key have been computed.
 */
export default class ProofTester<IN extends string[] = []> {
  public readonly protocol: 'groth16' | 'plonk';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly verificationKey: any;

  /**
   * Sets the paths & loads the verification key. The underlying proof system is checked by looking
   * at `verificationKey.protocol`.
   * @param circuit a proof tester
   */
  constructor(readonly wasmPath: string, readonly pkeyPath: string, readonly vkeyPath: string) {
    this.verificationKey = JSON.parse(readFileSync(vkeyPath).toString()) as typeof this.verificationKey;

    const protocol = this.verificationKey.protocol;
    if (!PROOF_SYSTEMS.includes(protocol)) {
      throw new Error('Unknown protocol in verification key: ' + protocol);
    }
    this.protocol = protocol;
  }

  /**
   * Generate a proof for the witness computed from the given input signals.
   * Calls `fullProve` behind the scenes.
   * @param input input signals for the circuit
   * @returns a proof and public signals
   */
  async prove(input: CircuitSignals<IN>): Promise<FullProof> {
    return await snarkjs[this.protocol].fullProve(input, this.wasmPath, this.proverKeyPath);
  }

  /**
   * Verify a proof for some public signals.
   * @param proof proof object, given from `prove`
   * @param publicSignals public signals for the circuit
   * @returns `true` if proof verifies, `false` otherwise
   */
  async verify(proof: object, publicSignals: string[]): Promise<boolean> {
    return await snarkjs[this.protocol].verify(this.verificationKey, publicSignals, proof);
  }

  /**
   * Verification should pass for this proof and public signals.
   * @param proof proof object, given from `prove`
   * @param publicSignals public signals for the circuit
   */
  async expectPass(proof: object, publicSignals: string[]): Promise<void> {
    expect(await this.verify(proof, publicSignals)).to.be.true;
  }

  /**
   * Verification should fail for this proof and public signals.
   * @param proof proof object, given from `prove`
   * @param publicSignals public signals for the circuit
   */
  async expectFail(proof: object, publicSignals: string[]): Promise<void> {
    expect(await this.verify(proof, publicSignals)).to.be.false;
  }
}
