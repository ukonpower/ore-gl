declare var AudioContext: any;
declare var webkitAudioContext: any;

export default class MicData{

	private navigator: Navigator;
	private context: AudioContext;
	private analyzer: AnalyserNode;
	private bufferSize: number;
	private bufferArray: Uint8Array;

	private processor: ScriptProcessorNode;

	public volume: number = 0.0;

	constructor( navigator: Navigator, bufferSize: number ){

		// this.bufferArray = [];

		this.navigator = navigator;
		this.bufferSize = bufferSize;

		this.navigator.mediaDevices.getUserMedia( { audio: true, video: false } )
			.then( this.onGetUserMesia.bind( this ) );

	}

	private onGetUserMesia( stream: MediaStream ){

		this.context = new ((<any>window).AudioContext || (<any>window).webkitAudioContext)();
		this.analyzer = this.context.createAnalyser();
		this.analyzer.fftSize = this.bufferSize;
		
		this.analyzer.smoothingTimeConstant = 0.8;
		
		let input = this.context.createMediaStreamSource( stream );
		this.processor = this.context.createScriptProcessor( this.bufferSize , 1, 1 );

		input.connect( this.analyzer );
		this.analyzer.connect( this.processor );
		this.processor.connect( this.context.destination );

		this.processor.addEventListener( 'audioprocess', this.onProcess.bind(this) );

	}

	private onProcess( e: AudioProcessingEvent ){

		this.bufferArray =  new Uint8Array( this.analyzer.frequencyBinCount );
		this.analyzer.getByteFrequencyData( this.bufferArray );

		this.calcVolume();
		
	}

	private calcVolume( ){

		let sum = 0;

		for( let i = 0; i < this.bufferArray.length; i++ ){

			sum += this.bufferArray[i];
			
		}

		this.volume = sum / this.bufferArray.length;

	}


}