## Compile the circuit, outputting R1CS and JS files
compile() {
  echo -e "\n${CLIENV_COLOR_TITLE}=== Compiling the circuit ===${CLIENV_COLOR_RESET}"
  local CIRCUIT=$1

  # generate the circuit main component
  node ./scripts/instantiate.js $CIRCUIT
  local CIRCOM_IN=./circuits/main/$CIRCUIT.circom
  local CIRCOM_OUT=./build/$CIRCUIT
  
  # create build dir if not exists already
  mkdir -p $CIRCOM_OUT

  # compile with circom
  echo "circom $CIRCOM_IN -o $CIRCOM_OUT $CLIENV_COMPILER_ARGS"
  circom $CIRCOM_IN -o $CIRCOM_OUT $CLIENV_COMPILER_ARGS

  echo -e "${CLIENV_COLOR_LOG}Built artifacts under $CIRCOM_OUT${CLIENV_COLOR_RESET}"
}