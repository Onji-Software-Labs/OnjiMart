package com.sattva;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {MongoAutoConfiguration.class})
@EnableConfigurationProperties
@EnableDiscoveryClient
@EnableScheduling
@EnableAsync
public class SattvaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SattvaApplication.class, args);
		System.out.println("Ae Devi Bhairavi");
	}
	   @Bean
	    public ModelMapper modelMapper() {
	        return new ModelMapper();
	    }

}
